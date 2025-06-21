import api from "../utils/api";
export const getConfigurators = async () => {
    const response = await api.get('/user/enterprise')
    return response.data.data
}

export const getUserInfo = async () => {
    const response = await api.get('/user/info')
    return response.data.data
}
export const uploadAvatar = async (formData: FormData) => {
  const res = await api.put('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data.data;
};