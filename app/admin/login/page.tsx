"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeStage, setFadeStage] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Set fade-in animation on component mount
  useState(() => {
    const fadeTimeout = setTimeout(() => setFadeStage(3), 100);
    return () => clearTimeout(fadeTimeout);
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      console.log("Full API Response:", result); // ✅ Log response
  
      if (!response.ok || !result.token) {
        throw new Error(result.message || "Login failed");
      }
  
      // ✅ Store token in localStorage
      localStorage.setItem("adminToken", result.token);
      console.log("Stored Token:", localStorage.getItem("adminToken"));
  
      // ✅ Redirect to dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  

  const getFadeClass = () => {
    switch (fadeStage) {
      case 0:
        return "opacity-0";
      case 1:
        return "opacity-25";
      case 2:
        return "opacity-50";
      default:
        return "opacity-100";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-green-50">
      <div
        className={`w-full max-w-md mx-4 overflow-hidden rounded-3xl shadow-lg bg-white ${getFadeClass()} transition-opacity duration-500`}
      >
        {/* Top Flower Decoration */}
        <div className="w-full h-40 flex justify-center overflow-hidden">
          <Image
            width={500}
            height={150}
            src="/card_design/top_flower.webp"
            alt="Lilac flowers"
            className="w-full scale-110 object-cover object-bottom"
            priority
          />
        </div>

        <div className="px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-['Cormorant_Garamond',serif] text-[#0A5741] text-center mb-8">
            Admin Login
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#0A5741] mb-1">
                Username
              </label>
              <Input
                {...register("username")}
                className="w-full rounded-xl border-2 border-purple-200 focus:border-[#0A5741] focus:ring-[#0A5741] py-2"
                disabled={loading}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A5741] mb-1">
                Password
              </label>
              <Input
                type="password"
                {...register("password")}
                className="w-full rounded-xl border-2 border-purple-200 focus:border-[#0A5741] focus:ring-[#0A5741] py-2"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#0A5741] hover:bg-[#0A5741]/90 text-white rounded-xl py-2"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>

        {/* Bottom Flower Decoration */}
        <div className="w-full h-40 flex justify-center overflow-hidden">
          <Image
            width={500}
            height={150}
            src="/card_design/top_flower.webp"
            alt="Lilac flowers"
            className="w-full scale-110 object-cover object-bottom"
            style={{ transform: "rotate(180deg)" }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
