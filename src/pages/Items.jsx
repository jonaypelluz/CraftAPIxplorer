import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout } from 'antd';
import ApiService from 'services/ApiService';
import Grid from 'components/Grid';
import Pagination from 'components/Pagination';
import Loader from 'components/Loader';
import Toast from 'components/Toast';
import Logger from 'services/Logger';
import { useSectionContext } from 'store/SectionContext';

const selectedSection = (config, route) => {
    return config[route];
};

const Items = () => {
    const sectionContext = useSectionContext();
    const [error, setError] = useState();
    const [items, setItems] = useState({ results: [], count: 0 });
    const { config } = useSelector((state) => state.apiConfig);
    const api = ApiService();
    const params = useParams();
    const currentPage = 'page' in params ? parseInt(params.page) : 1;

    const location = useLocation();
    const route = location.pathname.split('/')[1];
    const section = selectedSection(config, route);
    sectionContext.setSelectedSection(route);

    Logger.log(`Selected section "${route}": `, section);

    const hasPagination = section.pagination;
    const perPage = section.perPage;

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const results = await api.getItems(config, route, currentPage);
                Logger.log('Final items:', results);
                setItems(results);
            } catch (error) {
                setError(error);
            }
        };

        fetchItems();
    }, [currentPage, section]);

    if (api.loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <Toast
                toastList={[
                    {
                        type: 'error',
                        description: error,
                    },
                ]}
            />
        );
    }

    return (
        <Layout style={{ padding: '20px 50px', backgroundColor: '#fff' }}>
            <Grid items={items.results} />
            {hasPagination !== '' && (
                <Pagination
                    totalItems={items.count}
                    itemsPerPage={perPage}
                    currentPage={currentPage}
                    baseUrl={`/${route}/page`}
                />
            )}
        </Layout>
    );
};

export default Items;
