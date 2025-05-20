import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import api from '../lib/axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Validate token by checking if it's provided in the URL params (from email link) or not
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      setValidatingToken(false);
      return;
    }

    const validateTokenWithBackend = async () => {
      try {
        console.log('Validating token:', token);
        const response = await api.get(`/api/auth/validate-reset-token/${token}`);
        console.log('Token validation successful:', response.data);
        setTokenValid(true);
      } catch (error) {
        console.error('Token validation error:', error);
        setError('Invalid or expired token. Please request a new password reset link.');
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    validateTokenWithBackend();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted with token:', token);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/;

    console.log(`Password validation: Length=${formData.password.length}, Has lowercase=${/[a-z]/.test(formData.password)}, Has uppercase=${/[A-Z]/.test(formData.password)}, Has number=${/\d/.test(formData.password)}, Has special=${/[@$!%*?&.,]/.test(formData.password)}`);

    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number and special character');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sending password reset request with token:', token);
      console.log('Password payload:', { token, password: formData.password.substring(0, 3) + '...' });

      // Make the API request using axios
      const response = await api.post('/api/auth/reset-password', {
        token,
        password: formData.password
      });

      console.log('Password reset response:', response);
      console.log('Password reset successful:', response.data);

      // Store isProfileComplete status if available
      if (response.data.isProfileComplete !== undefined) {
        console.log('Profile completion status:', response.data.isProfileComplete);

        // Get existing user data from localStorage if available
        const existingUserData = localStorage.getItem('userData');
        if (existingUserData) {
          try {
            const userData = JSON.parse(existingUserData);
            // Update the isProfileComplete field
            userData.isProfileComplete = response.data.isProfileComplete;
            // Save back to localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('Updated user data in localStorage with profile completion status');
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
        }
      }

      setSuccess(true);

      // Redirect to login after 5 seconds
      setTimeout(() => {
        console.log('Redirecting to login page...');
        navigate('/auth');
      }, 5000);

    } catch (error) {
      console.error('Password reset error:', error);

      const errorMessage = error.response?.data?.message ||
                           'An error occurred. Please try again later.';

      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      });

      if (error.response?.status === 400) {
        setError('Invalid or expired token. Please request a new password reset link.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardContent className="flex justify-center items-center p-8">
            <div className="text-cyan-100">Validating reset token...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-cyan-100">
            Reset Your Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Invalid token state */}
          {!tokenValid && (
            <Alert className="bg-red-900/50 border-red-800 text-red-200 mb-4">
              <AlertDescription>
                {error || 'Invalid reset token. Please request a new password reset link.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Success state */}
          {tokenValid && success && (
            <Alert className="bg-emerald-900/50 border-emerald-800 text-emerald-200 mb-4">
              <AlertDescription>
                Your password has been successfully reset! Redirecting you to login...
              </AlertDescription>
            </Alert>
          )}

          {/* Form state */}
          {tokenValid && !success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-cyan-100">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-zinc-500" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10 bg-zinc-800 border-zinc-700 text-cyan-100"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-zinc-400">
                  Password must be at least 8 characters with uppercase, lowercase, number and special character (like @, $, !, %, *, ?, &, ., or ,).
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-cyan-100">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-zinc-500" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10 bg-zinc-800 border-zinc-700 text-cyan-100"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-center w-full text-sm text-zinc-400">
            <Link to="/auth" className="text-cyan-400 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;