import { api } from "@/lib/api";

export type NgrokUser = {
  _id: string;
  username: string;
};

export const createNgrokUser = async (username: string) => {
  const { data } = await api.post(`/api/users`, { username });
  return data?.data as NgrokUser;
};

export const likeNgrok = async (userId: string, imdbId: string) => {
  const { data } = await api.post(`/api/users/${userId}/like/${imdbId}`);
  return data;
};

export const unlikeNgrok = async (userId: string, imdbId: string) => {
  const { data } = await api.delete(`/api/users/${userId}/like/${imdbId}`);
  return data;
};

export const addToHistoryNgrok = async (userId: string, imdbId: string) => {

  console.log("adding to history", userId, imdbId);
    
  const { data } = await api.post(`/api/users/${userId}/history/${imdbId}` , 
    {
    "viewDuration": 7200
    }
);
  return data;
};

export const getLikedNgrok = async (userId: string) => {
  const { data } = await api.get(`/api/users/${userId}/liked`);
  return (data?.data || []) as Array<{ movie: { imdbID: string; Title: string; Poster: string; Genre?: string[]; Year?: string } }>;
};


