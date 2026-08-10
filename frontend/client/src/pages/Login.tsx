import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LockKeyhole, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  mobile: z.string().trim().min(1, "Please enter a valid mobile number"),
  password: z.string().trim().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const form = useForm({ resolver: zodResolver(loginSchema) });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const success = await login(data.mobile, data.password);
      if (success) {
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        setLocation("/dashboard");
      } else {
        toast({ 
          title: "Login failed", 
          description: "Invalid mobile number or password.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: "An error occurred during login.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/30 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30 mb-4">
            F
          </div>
          <h1 className="text-3xl font-display font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your finance dashboard.</p>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-white/90 dark:bg-card/90">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input {...form.register("mobile")} className="pl-10 h-11 rounded-xl" placeholder="9876543210" />
                </div>
                {form.formState.errors.mobile && <p className="text-xs text-destructive">{form.formState.errors.mobile.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input type="password" {...form.register("password")} className="pl-10 h-11 rounded-xl" placeholder="••••••••" />
                </div>
                {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message as string}</p>}
              </div>

              <ButtonCustom type="submit" size="lg" className="w-full text-base" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </ButtonCustom>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account? <span className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => setLocation("/signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
