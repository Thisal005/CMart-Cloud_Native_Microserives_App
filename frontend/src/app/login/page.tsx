"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogIn, Loader2 } from "lucide-react";
import { useLoginMutation } from "@/features/auth/hooks/use-auth-queries";
import { GuestLayout } from "@/components/layout/guest-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { parseApiError } from "@/utils/error-parser";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Failed to log in");
    }
  };

  return (
    <GuestLayout>
      <div className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome to CMart</CardTitle>
            <CardDescription>Enter your email and password to log in</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Email Address */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm leading-none font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={
                    errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                  }
                  {...register("email")}
                  disabled={loginMutation.isPending}
                />
                {errors.email && (
                  <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm leading-none font-medium">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={
                    errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                  }
                  {...register("password")}
                  disabled={loginMutation.isPending}
                />
                {errors.password && (
                  <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
              <div className="text-muted-foreground text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary font-semibold underline-offset-4 hover:underline"
                >
                  Create one now
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </GuestLayout>
  );
}
