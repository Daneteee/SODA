import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const useProtectedRoute = () => {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("jwtToken");

    if (!token) {
      router.replace("/login");
    }
  }, [router]); 
};
