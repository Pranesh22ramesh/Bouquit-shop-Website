import React, { createContext, useCallback, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../api/authService";
import { clearAccessToken } from "../lib/authStorage";
import { emitSiteEvent, SITE_EVENTS } from "../lib/siteEvents";
import { startPrivateRealtime } from "../lib/privateRealtime";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const setUser = (nextUser) => {
    queryClient.setQueryData(["auth", "me"], nextUser);
  };

  const applyAuthenticatedUser = (nextUser) => {
    setUser(nextUser);
    return nextUser;
  };

  const signup = async (payload) => applyAuthenticatedUser(await authService.signup(payload));
  const login = async (payload) => applyAuthenticatedUser(await authService.login(payload));
  const adminLogin = async (payload) => applyAuthenticatedUser(await authService.adminLogin(payload));

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAccessToken();
      setUser(null);
      queryClient.removeQueries({ queryKey: ["cart"] });
    }
  }, [queryClient]);

  useEffect(() => {
    if (!user) return undefined;

    return startPrivateRealtime({
      onEvent: async ({ event, data }) => {
        switch (event) {
          case "profile.changed":
            if (data?.user) setUser(data.user);
            emitSiteEvent(SITE_EVENTS.privateProfileChanged, data || {});
            break;
          case "cart.changed":
            emitSiteEvent(SITE_EVENTS.privateCartChanged, data || {});
            break;
          case "orders.changed":
            emitSiteEvent(SITE_EVENTS.privateOrdersChanged, data || {});
            break;
          case "activities.changed":
            emitSiteEvent(SITE_EVENTS.privateActivitiesChanged, data || {});
            break;
          case "reviews.changed":
            emitSiteEvent(SITE_EVENTS.privateReviewsChanged, data || {});
            break;
          case "account.disabled":
          case "account.deleted":
            emitSiteEvent(SITE_EVENTS.privateAccountDisabled, data || {});
            toast.error("Your account session was closed by an administrator.");
            await logout();
            break;
          default:
            break;
        }
      },
      onAuthExpired: async () => {
        try {
          const refreshedUser = await authService.refresh();
          if (refreshedUser) {
            setUser(refreshedUser);
            return true;
          }
        } catch (error) {
          return false;
        }

        return false;
      },
      onError: (error) => {
        console.error("Private realtime connection error", error);
      },
    });
  }, [logout, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin" || user?.isAdmin,
        signup,
        login,
        adminLogin,
        logout,
        refreshUser: async () => {
          const result = await refetch();
          return result.data;
        },
        updateUser: (updates) => {
          queryClient.setQueryData(["auth", "me"], (currentUser) =>
            currentUser ? { ...currentUser, ...updates } : currentUser
          );
        },
        loading: isLoading,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
