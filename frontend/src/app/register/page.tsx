"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Loader2 } from "lucide-react";
import { useRegisterMutation } from "@/features/auth/hooks/use-auth-queries";
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
import { validationPatterns } from "@/utils/validation";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      validationPatterns.strongPassword,
      "Password must include uppercase, lowercase, a number, and a special character"
    ),
  phoneNumber: z.string().optional(),
  role: z.string(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      role: "USER",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const payload = {
        ...values,
        phoneNumber: values.phoneNumber || undefined,
      };
      await registerMutation.mutateAsync(payload);
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Failed to create account");
    }
  };

  return (
    <GuestLayout>
      <div className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
            <CardDescription>Enter your details to create your CMart account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm leading-none font-medium">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Ava"
                    className={
                      errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""
                    }
                    {...register("firstName")}
                    disabled={registerMutation.isPending}
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-xs font-medium">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm leading-none font-medium">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Patel"
                    className={
                      errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""
                    }
                    {...register("lastName")}
                    disabled={registerMutation.isPending}
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-xs font-medium">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

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
                  disabled={registerMutation.isPending}
                />
                {errors.email && (
                  <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm leading-none font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={
                    errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                  }
                  {...register("password")}
                  disabled={registerMutation.isPending}
                />
                {errors.password && (
                  <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm leading-none font-medium">
                  Phone Number (Optional)
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1-555-0101"
                  className={
                    errors.phoneNumber ? "border-destructive focus-visible:ring-destructive" : ""
                  }
                  {...register("phoneNumber")}
                  disabled={registerMutation.isPending}
                />
                {errors.phoneNumber && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </>
                )}
              </Button>
              <div className="text-muted-foreground text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-semibold underline-offset-4 hover:underline"
                >
                  Log in instead
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </GuestLayout>
  );
}
