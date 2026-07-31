import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginApiV1AuthLoginPost, getMeApiV1AuthMeGet, UserLoginRequest } from "@repo/api";
import { createSession } from "../actions";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: UserLoginRequest) => {
      const response = await loginApiV1AuthLoginPost(credentials);
      
      // Axios or orval handles throwing if status is not 200, 
      // but let's be safe.
      if (!response || 'detail' in response) {
        throw new Error("Invalid credentials");
      }

      const tokenData = response as import("@repo/api").TokenResponse;
      
      // Store in HTTP-only cookies via Server Action
      await createSession(tokenData.access_token, tokenData.refresh_token);
      
      // Since it's direct JSON, return tokenData directly
      return tokenData;
    },
    onSuccess: () => {
      // Invalidate queries so that anything depending on the auth state refreshes
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useMeQuery() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await getMeApiV1AuthMeGet();
      return response; // customClient returns the payload directly
    },
  });
}
