'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/lib/i18n';
import { logoutAction, updateProfileAction, changePasswordAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  User,
  LogOut,
  Loader2,
  Lock,
} from 'lucide-react';

// Schemas
const createProfileSchema = (t: any) =>
  zod.object({
    username: zod.string().min(3, t('validation.minLength', { min: 3 })),
    email: zod.string().email(t('validation.invalidEmail')),
  });

const createPasswordSchema = (t: any) =>
  zod
    .object({
      currentPassword: zod.string().min(6, t('validation.minLength', { min: 6 })),
      password: zod.string().min(6, t('validation.minLength', { min: 6 })),
      passwordConfirmation: zod.string().min(6, t('validation.minLength', { min: 6 })),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords do not match",
      path: ['passwordConfirmation'],
    });

type ProfileFormValues = zod.infer<ReturnType<typeof createProfileSchema>>;
type PasswordFormValues = zod.infer<ReturnType<typeof createPasswordSchema>>;

type ProfileClientProps = {
  user: {
    id: number;
    username: string;
    email: string;
  };
  locale: Locale;
};

export function ProfileClient({ user: initialUser, locale }: ProfileClientProps) {
  const router = useRouter();
  const t = useTranslations();
  const [user, setUser] = useState(initialUser);
  const [isPending, startTransition] = useTransition();

  const isRtl = locale === 'ar';

  const profileSchema = createProfileSchema(t);
  const passwordSchema = createPasswordSchema(t);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onUpdateProfile = (values: ProfileFormValues) => {
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result.success && result.user) {
        setUser(result.user);
        toast.success(t('auth.successProfileUpdate') || 'Profile updated successfully!');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    });
  };

  const onChangePassword = (values: PasswordFormValues) => {
    startTransition(async () => {
      const result = await changePasswordAction(values);
      if (result.success) {
        toast.success(t('auth.successPasswordUpdate') || 'Password updated successfully!');
        resetPasswordForm();
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      toast.success(t('auth.logout') || 'Logged out');
      router.push(`/${locale}`);
      router.refresh();
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/65 backdrop-blur-md p-6 sm:p-8 shadow-xl mb-10 flex flex-col sm:flex-row items-center gap-6 sm:text-start text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent -z-10" />
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{user.username}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="sm:ms-auto">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-sm font-semibold h-11 px-5 flex items-center gap-2 cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {t('auth.logout') || 'Logout'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Account Details Form */}
        <Card className="border-border/50 shadow-lg rounded-2xl overflow-hidden bg-card">
          <CardHeader className="border-b border-border/30 bg-muted/10">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              {t('auth.accountDetails') || 'Account Details'}
            </CardTitle>
                  <CardDescription className="text-xs">
                    Update your primary account contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="username" className="text-xs font-bold text-foreground/80">
                        {t('auth.username')}
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        className="rounded-xl h-11"
                        disabled={isPending}
                        {...registerProfile('username')}
                      />
                      {profileErrors.username && (
                        <p className="text-xs text-destructive font-semibold mt-1">{profileErrors.username.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="email" className="text-xs font-bold text-foreground/80">
                        {t('auth.email')}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        className="rounded-xl h-11"
                        disabled={isPending}
                        {...registerProfile('email')}
                      />
                      {profileErrors.email && (
                        <p className="text-xs text-destructive font-semibold mt-1">{profileErrors.email.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl text-sm font-semibold transition-all mt-4"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin me-2" />
                          {t('auth.updating')}
                        </>
                      ) : (
                        t('auth.editProfile') || 'Update Profile'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Password Change Form */}
              <Card className="border-border/50 shadow-lg rounded-2xl overflow-hidden bg-card">
                <CardHeader className="border-b border-border/30 bg-muted/10">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Lock className="h-4.5 w-4.5 text-primary" />
                    {t('auth.changePassword') || 'Change Password'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update your password regularly to secure your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="currentPassword" className="text-xs font-bold text-foreground/80">
                        {t('auth.currentPassword')}
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        className="rounded-xl h-11"
                        disabled={isPending}
                        {...registerPassword('currentPassword')}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-destructive font-semibold mt-1">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="password" className="text-xs font-bold text-foreground/80">
                        {t('auth.newPassword')}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="rounded-xl h-11"
                        disabled={isPending}
                        {...registerPassword('password')}
                      />
                      {passwordErrors.password && (
                        <p className="text-xs text-destructive font-semibold mt-1">{passwordErrors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="passwordConfirmation" className="text-xs font-bold text-foreground/80">
                        {t('auth.confirmPassword')}
                      </Label>
                      <Input
                        id="passwordConfirmation"
                        type="password"
                        placeholder="••••••••"
                        className="rounded-xl h-11"
                        disabled={isPending}
                        {...registerPassword('passwordConfirmation')}
                      />
                      {passwordErrors.passwordConfirmation && (
                        <p className="text-xs text-destructive font-semibold mt-1">{passwordErrors.passwordConfirmation.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl text-sm font-semibold transition-all mt-4"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin me-2" />
                          {t('auth.updating')}
                        </>
                      ) : (
                        t('auth.changePassword') || 'Change Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
      </div>
    </div>
  );
}
