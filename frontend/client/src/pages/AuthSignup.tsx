import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateUser } from "@/hooks/use-finance";
import { useAuth } from "@/contexts/AuthContext";
import { insertUserSchema } from "@shared/schema";
import { Check, ChevronRight, ChevronLeft, Fingerprint, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// We'll define schemas for each step
const step1Schema = insertUserSchema.pick({ fullName: true, email: true, mobile: true, city: true, country: true });
const step2Schema = z.object({ linkedAccountIds: z.array(z.number()) });
const step3Schema = insertUserSchema.pick({ monthlyBudget: true, currency: true });
const step4Schema = insertUserSchema.pick({ username: true, password: true, appPin: true, fingerprintEnabled: true });

function buildSignupPayload(formData: Partial<z.infer<typeof insertUserSchema>>, stepData: Record<string, unknown>) {
  const payload = {
    ...formData,
    ...stepData,
    username: stepData.username ?? formData.username ?? formData.fullName?.replace(/\s+/g, "_"),
    password: stepData.password ?? formData.password,
    fullName: formData.fullName,
    email: formData.email,
    mobile: formData.mobile,
    city: formData.city,
    country: formData.country,
    monthlyBudget: formData.monthlyBudget,
    currency: formData.currency,
    appPin: stepData.appPin ?? formData.appPin,
    fingerprintEnabled: stepData.fingerprintEnabled ?? formData.fingerprintEnabled ?? false,
    isProfileComplete: true,
  };

  return payload;
}

export default function AuthSignup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<z.infer<typeof insertUserSchema>>>({});
  const createUser = useCreateUser();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const handleFinalSubmit = async (data: any) => {
    const finalData = buildSignupPayload(formData, data);
    try {
      await createUser.mutateAsync(finalData);
      toast({ title: "Account Created!", description: "Welcome to FinTrack." });
      const loggedIn = await login(finalData.mobile as string, finalData.password as string);
      if (loggedIn) {
        setLocation("/dashboard");
      } else {
        toast({ title: "Signup complete", description: "Please login with your new account." });
        setLocation("/login");
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Step {step} of 4</p>
          <div className="flex gap-2 justify-center mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-primary' : 'w-4 bg-border'}`} 
              />
            ))}
          </div>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-card/50">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && <Step1 onNext={handleNext} key="step1" />}
              {step === 2 && <Step2 onNext={handleNext} onBack={() => setStep(1)} key="step2" />}
              {step === 3 && <Step3 onNext={handleNext} onBack={() => setStep(2)} key="step3" />}
              {step === 4 && <Step4 onSubmit={handleFinalSubmit} onBack={() => setStep(3)} isLoading={createUser.isPending} key="step4" />}
            </AnimatePresence>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account? <span className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => setLocation("/login")}>Log in</span>
        </p>
      </div>
    </div>
  );
}

function Step1({ onNext }: { onNext: (data: any) => void }) {
  const form = useForm({ resolver: zodResolver(step1Schema) });
  
  return (
    <motion.form 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      onSubmit={form.handleSubmit(onNext)} 
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>Full Name</Label>
          <Input {...form.register("fullName")} placeholder="John Doe" className="h-11 rounded-xl" />
          {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message as string}</p>}
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Email</Label>
          <Input type="email" {...form.register("email")} placeholder="john@example.com" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Mobile</Label>
          <Input {...form.register("mobile")} placeholder="+1 234 567 8900" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input {...form.register("city")} placeholder="New York" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input {...form.register("country")} placeholder="USA" className="h-11 rounded-xl" />
        </div>
      </div>
      <ButtonCustom type="submit" size="lg" className="w-full mt-4">
        Next Step <ChevronRight className="ml-2 w-4 h-4" />
      </ButtonCustom>
    </motion.form>
  );
}

function Step2({ onNext, onBack }: { onNext: (data: any) => void; onBack: () => void }) {
  // Mock data for banks found by mobile number
  const mockBanks = [
    { id: 1, name: "Chase Bank", account: "Checking •••• 4589" },
    { id: 2, name: "Bank of America", account: "Savings •••• 1290" },
    { id: 3, name: "Citi", account: "Credit Card •••• 8821" },
  ];
  
  const [selected, setSelected] = useState<number[]>([1, 2]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">We found these accounts</h3>
        <p className="text-sm text-muted-foreground">Linked to your mobile number</p>
      </div>

      <div className="space-y-3">
        {mockBanks.map((bank) => (
          <div 
            key={bank.id}
            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selected.includes(bank.id) ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
            onClick={() => {
              if (selected.includes(bank.id)) setSelected(selected.filter(id => id !== bank.id));
              else setSelected([...selected, bank.id]);
            }}
          >
            <Checkbox checked={selected.includes(bank.id)} className="mr-4" />
            <div className="flex-1">
              <p className="font-bold text-foreground">{bank.name}</p>
              <p className="text-sm text-muted-foreground">{bank.account}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <ButtonCustom type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </ButtonCustom>
        <ButtonCustom type="button" size="lg" onClick={() => onNext({ linkedAccountIds: selected })} className="flex-1">
          Confirm <Check className="ml-2 w-4 h-4" />
        </ButtonCustom>
      </div>
    </motion.div>
  );
}

function Step3({ onNext, onBack }: { onNext: (data: any) => void; onBack: () => void }) {
  const form = useForm({ 
    defaultValues: { monthlyBudget: "5000", currency: "USD" },
    resolver: zodResolver(step3Schema) 
  });

  return (
    <motion.form 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      onSubmit={form.handleSubmit(onNext)} 
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Monthly Budget Target</Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-muted-foreground">$</span>
            <Input {...form.register("monthlyBudget")} type="number" className="pl-8 h-12 text-lg rounded-xl" />
          </div>
          <p className="text-xs text-muted-foreground">We'll alert you if you exceed this amount.</p>
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <select 
            {...form.register("currency")} 
            className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <ButtonCustom type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </ButtonCustom>
        <ButtonCustom type="submit" size="lg" className="flex-1">
          Next Step <ChevronRight className="ml-2 w-4 h-4" />
        </ButtonCustom>
      </div>
    </motion.form>
  );
}

function Step4({ onSubmit, onBack, isLoading }: { onSubmit: (data: any) => void; onBack: () => void; isLoading: boolean }) {
  const form = useForm<z.infer<typeof step4Schema>>({ 
    resolver: zodResolver(step4Schema),
    defaultValues: {
      username: "",
      password: "",
      appPin: "",
      fingerprintEnabled: true,
    }
  });

  return (
    <motion.form 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      onSubmit={form.handleSubmit(onSubmit)} 
      className="space-y-6"
    >
      <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-3 rounded-lg flex gap-3 items-start text-sm">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
        <p>🔒 Your account is protected with secure login. You can access it from your phone or desktop.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Username</Label>
          <Input {...form.register("username")} className="h-11 rounded-xl" />
          {form.formState.errors.username && <p className="text-xs text-destructive">{form.formState.errors.username.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" {...form.register("password")} className="h-11 rounded-xl" />
          {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>App PIN (4 digits)</Label>
          <Input type="password" maxLength={4} {...form.register("appPin")} className="h-11 rounded-xl tracking-[0.5em] text-center font-bold" />
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Fingerprint className="w-6 h-6 text-primary" />
            <div className="text-sm">
              <p className="font-semibold">Biometric Login</p>
              <p className="text-muted-foreground">Use fingerprint/face ID</p>
            </div>
          </div>
          <Checkbox {...form.register("fingerprintEnabled")} />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <ButtonCustom type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </ButtonCustom>
        <ButtonCustom type="submit" size="lg" disabled={isLoading} className="flex-1">
          {isLoading ? "Creating..." : "Complete Setup"}
        </ButtonCustom>
      </div>
    </motion.form>
  );
}
