// LoadingProvider.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import LoadingCenter from "./LoadingCenter";

const LoadingContext = createContext(false);
export const useGlobalLoading = () => useContext(LoadingContext);

export default function LoadingProvider({ children, client = axios, shouldTrack }) {
  const [count, setCount] = useState(0);
  const reqId = useRef(null);
  const resId = useRef(null);

  useEffect(() => {
    const inc = () => setCount(c => c + 1);
    const dec = () => setCount(c => Math.max(0, c - 1));

    reqId.current = client.interceptors.request.use((config) => {
      const track =
        typeof shouldTrack === "function" ? !!shouldTrack(config) :
        config?.meta?.silent ? false : true;
      if (track) config.__trackLoading = true;
      if (config.__trackLoading) inc();
      return config;
    }, (error) => { dec(); return Promise.reject(error); });

    resId.current = client.interceptors.response.use((res) => {
      if (res.config?.__trackLoading) dec();
      return res;
    }, (error) => {
      if (error.config?.__trackLoading) dec();
      return Promise.reject(error);
    });

    return () => {
      if (reqId.current) client.interceptors.request.eject(reqId.current);
      if (resId.current) client.interceptors.response.eject(resId.current);
    };
  }, [client, shouldTrack]);

  const show = count > 0;

  return (
    <LoadingContext.Provider value={show}>
      {children}
      <LoadingCenter show={show} message="서버에서 데이터를 불러오는 중…" />
    </LoadingContext.Provider>
  );
}
