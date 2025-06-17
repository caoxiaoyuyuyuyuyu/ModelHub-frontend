import api from "../utils/api";
export const getConfigurators = async () => {
    const response = await api.get('/user/enterprise')
    return response.data.data
}