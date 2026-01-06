import { useState, useRef } from "react";
import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Camera, User, Mail, Phone, Bell } from "lucide-react";
import { api } from "@shared/routes";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";

export default function Profile() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    city: user?.city || "",
    country: user?.country || "",
    profilePicture: user?.profilePicture || null as string | null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navbar />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>
            <div className="flex items-center justify-end">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <div className="flex items-center justify-center h-full">
            <p>Loading profile...</p>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navbar />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>
            <div className="flex items-center justify-end">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <div className="flex items-center justify-center h-full">
            <p>Please log in to view your profile.</p>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      // Prepare the profile data to send to the backend
      const updatedProfile = {
        fullName: profileData.fullName,
        email: profileData.email,
        mobile: profileData.mobile,
        city: profileData.city,
        country: profileData.country,
        profilePicture: previewImage || profileData.profilePicture,
      };
      
      // Update the user profile on the backend
      const updatedUser = await apiPut(`/api/users/${user?.id}`, updatedProfile);
      
      // Update the local user context with the new data
      // For now, we'll just show a success message
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      city: user?.city || "",
      country: user?.country || "",
      profilePicture: user?.profilePicture || null,
    });
    setPreviewImage(null);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
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
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10 relative">
                    {(previewImage || user?.profilePicture) ? (
                      <img 
                        src={previewImage || user?.profilePicture || ""} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={triggerFileSelect}
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                {isEditing && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Click on the image to change
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!isEditing && (
                  <ButtonCustom 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                    Edit Profile
                  </ButtonCustom>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{profileData.fullName || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{profileData.email || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    {isEditing ? (
                      <Input
                        id="mobile"
                        name="mobile"
                        value={profileData.mobile}
                        onChange={handleInputChange}
                        placeholder="Enter your mobile number"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profileData.mobile || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        name="location"
                        value={`${profileData.city || ''}${profileData.city && profileData.country ? ', ' : ''}${profileData.country || ''}`}
                        onChange={(e) => {
                          const [city, country] = e.target.value.split(', ');
                          setProfileData(prev => ({
                            ...prev,
                            city: city || '',
                            country: country || ''
                          }));
                        }}
                        placeholder="Enter your location (e.g. City, Country)"
                      />
                    ) : (
                      <div>
                        {profileData.city || profileData.country ? (
                          <span>{profileData.city}{profileData.city && profileData.country ? ', ' : ''}{profileData.country}</span>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <ButtonCustom onClick={handleSave}>
                      Save Changes
                    </ButtonCustom>
                    <ButtonCustom 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </ButtonCustom>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}