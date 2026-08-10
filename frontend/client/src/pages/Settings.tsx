import { useState } from "react";
import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Bell, Eye, EyeOff, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";
import { FinCard } from "@/components/ui/FinCard";

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fingerprintAuth, setFingerprintAuth] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  
  const handleSave = () => {
    // In a real app, this would save settings to the backend
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-border/60 bg-gradient-to-br from-background via-card/80 to-background p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Preferences
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage your account preferences</p>
          </div>
          <div className="flex items-center gap-4">
            <ButtonCustom variant="outline" size="icon" className="rounded-xl">
              <Bell className="w-5 h-5" />
            </ButtonCustom>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <ProfileDropdown>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold cursor-pointer">
                {user?.fullName?.[0] || "U"}
              </div>
            </ProfileDropdown>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <FinCard className="p-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      defaultValue={user?.fullName || ""} 
                      placeholder="Enter your full name" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={user?.email || ""} 
                      placeholder="Enter your email" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input 
                    id="mobile" 
                    defaultValue={user?.mobile || ""} 
                    placeholder="Enter your mobile number" 
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    defaultValue={user?.city ? `${user.city}, ${user?.country || ''}` : ""} 
                    placeholder="Enter your location" 
                  />
                </div>
              </div>
            </FinCard>

            {/* Security Settings */}
            <FinCard className="p-6">
              <h2 className="text-xl font-semibold">Security</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fingerprint Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable fingerprint to unlock the app</p>
                  </div>
                  <Switch 
                    checked={fingerprintAuth} 
                    onCheckedChange={setFingerprintAuth} 
                  />
                </div>
                <div>
                  <Label htmlFor="pin">App PIN</Label>
                  <Input 
                    id="pin" 
                    type="password" 
                    placeholder="Set a 4-digit PIN" 
                  />
                </div>
              </div>
            </FinCard>

            {/* Notification Settings */}
            <FinCard className="p-6">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                  </div>
                  <Switch 
                    checked={notifications} 
                    onCheckedChange={setNotifications} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch 
                    checked={smsNotifications} 
                    onCheckedChange={setSmsNotifications} 
                  />
                </div>
              </div>
            </FinCard>
          </div>

          {/* Sidebar with additional options */}
          <div className="space-y-6">
            <FinCard className="p-6">
              <h2 className="text-xl font-semibold">Preferences</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Dark Mode</Label>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Biometric Login</Label>
                  <Switch 
                    checked={fingerprintAuth} 
                    onCheckedChange={setFingerprintAuth} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto-Lock</Label>
                  <div className="flex items-center space-x-2">
                    <select className="text-sm rounded-md border border-input bg-background px-2 py-1">
                      <option>1 min</option>
                      <option>5 min</option>
                      <option>15 min</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </FinCard>

            <FinCard className="p-6">
              <h2 className="text-xl font-semibold">Account</h2>
              <div className="mt-6 space-y-4">
                <ButtonCustom className="w-full">Change Password</ButtonCustom>
                <ButtonCustom variant="outline" className="w-full">Backup Data</ButtonCustom>
                <ButtonCustom variant="destructive" className="w-full">Delete Account</ButtonCustom>
              </div>
            </FinCard>

            <div className="text-center pt-4">
              <ButtonCustom onClick={handleSave} className="w-full">
                Save Settings
              </ButtonCustom>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}