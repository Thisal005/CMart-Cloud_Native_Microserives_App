import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService, LoginPayload, RegisterPayload } from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/store/use-auth-store";

export function useLoginMutation() {
  const { setSession } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (response) => {
      const { user, token, refreshToken } = response.data;
      setSession(user, token, refreshToken);
      toast.success(response.message || "Logged in successfully!");

      queryClient.clear();
      router.push("/dashboard");
    },
  });
}

export function useRegisterMutation() {
  const { setSession } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (response) => {
      const { user, token, refreshToken } = response.data;
      setSession(user, token, refreshToken);
      toast.success(response.message || "Account created successfully!");

      queryClient.clear();
      router.push("/dashboard");
    },
  });
}

export function useLogoutMutation() {
  const { clearSession, refreshToken: storedRefreshToken } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const rt =
        storedRefreshToken ||
        (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null);
      if (rt) {
        await authService.logout(rt);
      }
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
      toast.info("Logged out successfully");
      router.push("/login");
    },
  });
}

export function useUserProfileQuery(enabled = false) {
  return useQuery({
    queryKey: ["auth-profile"],
    queryFn: () => authService.getProfile(),
    enabled,
    retry: false,
    staleTime: Infinity,
  });
}
