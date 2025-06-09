import React from 'react';
import { useTranslations } from 'next-intl';
import { useFormState, useFormStatus } from 'react-dom';
import { signIn } from '@/app/actions/auth/sign-in';
import { ActionState } from '@/lib/types/api.bean';

const LoginForm: React.FC = () => {
  const t = useTranslations('LoginForm');
  const [state, formAction] = useFormState<ActionState, FormData>(signIn, {}); // Initialize state as an empty object

  const { pending } = useFormStatus();

  React.useEffect(() => {
    if (state && state.error) { // Simplify condition, as success might be undefined
      // Handle error, e.g., display a toast message
      console.error('Login failed:', state.error.message);
      // You might want to show a user-friendly error message here
    }
  }, [state]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('title')}</h2>
        <form action={formAction}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              {t('emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              name="email" // Add name attribute for form submission
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={t('emailPlaceholder')}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              {t('passwordLabel')}
            </label>
            <input
              type="password"
              id="password"
              name="password" // Add name attribute for form submission
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={t('passwordPlaceholder')}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={pending} // Disable button while submitting
            >
              {pending ? t('loggingIn') : t('loginButton')}
            </button>
          </div>
          {state && !state.success && state.error && (
            <p className="text-red-500 text-xs italic mt-4 text-center">
              {state.error.message}
            </p>
          )}
          {state && state.error && (
            <p className="text-red-500 text-xs italic mt-4 text-center">
              {state.error.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;