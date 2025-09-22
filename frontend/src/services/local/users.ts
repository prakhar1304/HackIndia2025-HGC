import { localApi } from "@/lib/local";

export type LocalUserPayload = {
  userId: string;
  countries: string[];
  languages: string[];
  watched: string[];
  liked: string[];
  fav_genres: string[];
  fav_actors: string[];
  fav_directors: string[];
  writers: string[];
};

export type CreateLocalUserResponse = { ok: boolean; userId: string };

export const createLocalUser = async (payload: LocalUserPayload) => {
  const { data } = await localApi.post(`/users`, payload);
  return data as CreateLocalUserResponse;
};

export const patchLocalUser = async (userId: string, body: Partial<LocalUserPayload> & { merge?: boolean }) => {
  const { data } = await localApi.patch(`/users/${userId}`, body);
  return data;
};

export const deleteLocalUser = async (userId: string) => {
  const { data } = await localApi.delete(`/users/${userId}`);
  return data;
};

export const getLocalProfile = async (userId: string) => {
  const { data } = await localApi.get(`/users/${userId}/profile`);
  return data;
};


