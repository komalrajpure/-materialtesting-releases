import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { DashboardLayout } from "../components/dashboard";


export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("burt_user");
    if (!stored) {
      router.replace("/login"); // not logged in → back to login
    } else {
      setUser(JSON.parse(stored));
      setReady(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("burt_user");
    sessionStorage.removeItem("burt_otp");
    sessionStorage.removeItem("burt_phone");
    router.replace("/login");
  };

  if (!ready) return null; // waiting for sessionStorage check

  return (
    <>
      <Head><title>Dashboard — bookURtest</title></Head>
      <DashboardLayout user={user} onLogout={handleLogout} />
    </>
  );
}