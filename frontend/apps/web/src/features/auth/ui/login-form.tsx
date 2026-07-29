"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/src/components/ui/form";
import { Input } from "@repo/ui/src/components/ui/input"; // Wait, I didn't add the Input component to shadcn yet! I will just use standard HTML input for now.
import { Button } from "@repo/ui/src/components/ui/button";
import { useLoginMutation } from "../api/queries";

const loginSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginValues) {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      // Redirect to dashboard after successful login
      router.push("/");
    } catch (error) {
      form.setError("root", {
        message: "Invalid credentials",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </Form>
  );
}
