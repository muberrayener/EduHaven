import axiosInstance from "@/utils/axios";

export const fetchAllUsers = async (search = "") => {
    const res = await axiosInstance.get(`/user?search=${encodeURIComponent(search)}`);
    return res.data.users;
  };
  