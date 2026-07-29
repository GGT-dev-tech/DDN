import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAuthLoginPost, UserLoginRequest } from "@repo/api";
import { createSession } from "../actions";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: UserLoginRequest) => {
      const response = await loginAuthLoginPost(credentials);
      
      // Axios or orval handles throwing if status is not 200, 
      // but let's be safe.
      if (!response.data || 'detail' in response.data) {
        throw new Error("Invalid credentials");
      }

      const tokenData = response.data as import("@repo/api").TokenResponse;
      
      // Store in HTTP-only cookies via Server Action
      await createSession(tokenData.access_token, tokenData.refresh_token);
      
      return tokenData;
    },
    onSuccess: () => {
      // Invalidate queries so that anything depending on the auth state refreshes
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
