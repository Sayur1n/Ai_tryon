'use client';

import { validateCaptchaAction } from '@/actions/validate-captcha';
import { AuthCard } from '@/components/auth/auth-card';
import { FormError } from '@/components/shared/form-error';
import { FormSuccess } from '@/components/shared/form-success';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/lib/auth-client';
import { getUrlWithLocaleInCallbackUrl } from '@/lib/urls/urls';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { Captcha } from '../shared/captcha';
import { SocialLoginButton } from './social-login-button';

interface RegisterFormProps {
  callbackUrl?: string;
}

export const RegisterForm = ({
  callbackUrl: propCallbackUrl,
}: RegisterFormProps) => {
  const t = useTranslations('AuthPage.register');
  const searchParams = useSearchParams();
  const paramCallbackUrl = searchParams.get('callbackUrl');
  // Use prop callback URL or param callback URL if provided, otherwise use the default login redirect
  const locale = useLocale();
  const defaultCallbackUrl = getUrlWithLocaleInCallbackUrl(
    DEFAULT_LOGIN_REDIRECT,
    locale
  );
  const callbackUrl = propCallbackUrl || paramCallbackUrl || defaultCallbackUrl;
  console.log('register form, callbackUrl', callbackUrl);

  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { refetch } = authClient.useSession();

  // turnstile captcha schema
  const turnstileEnabled = websiteConfig.features.enableTurnstileCaptcha;
  const captchaSchema = turnstileEnabled
    ? z.string().min(1, 'Please complete the captcha')
    : z.string().optional();

  const RegisterSchema = z.object({
    email: z.string().email({
      message: t('emailRequired'),
    }),
    password: z.string().min(1, {
      message: t('passwordRequired'),
    }),
    name: z.string().min(1, {
      message: t('nameRequired'),
    }),
    accountType: z.enum(['user', 'merchant', 'admin'], {
      required_error: t('accountTypeRequired'),
    }),
    captchaToken: captchaSchema,
  });

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      accountType: 'user',
      captchaToken: '',
    },
  });

  const captchaToken = useWatch({
    control: form.control,
    name: 'captchaToken',
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    // Validate captcha token if turnstile is enabled
    if (turnstileEnabled && values.captchaToken) {
      const captchaResult = await validateCaptchaAction({
        captchaToken: values.captchaToken,
      });

      if (!captchaResult?.data?.success || !captchaResult?.data?.valid) {
        const errorMessage = captchaResult?.data?.error || t('captchaInvalid');
        setError(errorMessage);
        return;
      }
    }

    // 将账号类型存储到sessionStorage，供后续使用
    sessionStorage.setItem('pendingAccountType', values.accountType);

    // 使用Better Auth的标准注册流程
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: callbackUrl,
      },
      {
        onRequest: (ctx) => {
          setIsPending(true);
          setError('');
          setSuccess('');
        },
        onResponse: (ctx) => {
          setIsPending(false);
        },
        onSuccess: async (ctx) => {
          // 设置用户角色（非阻塞）
          if (ctx.data.user?.id) {
            fetch('/api/auth/set-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: ctx.data.user.id,
                role: values.accountType,
              }),
            }).catch(error => {
              console.error('Failed to set user role:', error);
            });
          }

          // 注册成功后自动登录
          try {
            await authClient.signIn.email(
              {
                email: values.email,
                password: values.password,
                callbackURL: callbackUrl,
              },
              {
                onSuccess: async (ctx) => {
                  setSuccess('注册成功，正在跳转...');
                  
                  // 强制刷新会话以获取最新的用户信息
                  try {
                    await refetch();
                  } catch (error) {
                    console.error('Failed to refresh session:', error);
                  }
                },
                onError: (ctx) => {
                  setSuccess(t('checkEmail'));
                },
              }
            );
          } catch (error) {
            setSuccess(t('checkEmail'));
          }

          // add affonso affiliate
          if (websiteConfig.features.enableAffonsoAffiliate) {
            window.Affonso.signup(values.email);
          }
        },
        onError: (ctx) => {
          // sign up fail, display the error message
          setError(`${ctx.error.status}: ${ctx.error.message}`);
        },
      }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AuthCard
      headerLabel={t('createAccount')}
      bottomButtonLabel={t('signInHint')}
      bottomButtonHref={`${Routes.Login}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="name@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accountType')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('accountType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">{t('accountTypeUser')}</SelectItem>
                      <SelectItem value="merchant">{t('accountTypeMerchant')}</SelectItem>
                      <SelectItem value="admin">{t('accountTypeAdmin')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="******"
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        disabled={isPending}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="size-4 text-muted-foreground" />
                        ) : (
                          <EyeIcon className="size-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? t('hidePassword') : t('showPassword')}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          {turnstileEnabled && (
            <Captcha
              onSuccess={(token) => form.setValue('captchaToken', token)}
              validationError={form.formState.errors.captchaToken?.message}
            />
          )}
          <Button
            disabled={isPending || (turnstileEnabled && !captchaToken)}
            size="lg"
            type="submit"
            className="cursor-pointer w-full flex items-center justify-center gap-2"
          >
            {isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            <span>{t('signUp')}</span>
          </Button>
        </form>
      </Form>
      <div className="mt-4">
        <SocialLoginButton callbackUrl={callbackUrl} />
      </div>
    </AuthCard>
  );
};
