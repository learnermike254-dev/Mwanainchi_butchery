import { useEffect, useState } from "react";
import { getUserSession, phoneLogout } from "@/lib/phone-auth.functions";

export interface PhoneUser {
  id: string;
  phone: string;
  verified: boolean;
}

export function usePhoneAuth() {
  const [user, setUser] = useState<PhoneUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has a phone session stored
    const session = getUserSession();
    if (session) {
      setUser({
        id: session.userId,
        phone: session.phone,
        verified: true,
      });
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    await phoneLogout();
    setUser(null);
  };

  return { user, loading, logout };
}

export { phoneLogout };
