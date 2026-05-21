import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

/**
 * Login Page Component
 * Handles the business logic for user authentication and role-based redirection.
 */
const Login = () => {
  const navigate = useNavigate();

  // State Management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirection Map based on User Roles
  const roleRedirectMap = new Map([
    ['ADMIN', '/admin/dashboard'],
    ['AUTHOR', '/author/asks'],
    ['CONNECTOR', '/connector/kanban'],
    ['GIVER', '/giver/history'],
  ]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Por favor, contacte con el Administrador de AskingX para restablecer sus credenciales.");
  };

  /**
   * Handles form submission and authentication logic
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser(email, password);
      
      // Store token and user info securely
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Role-based Redirection
      const redirectPath = roleRedirectMap.get(user.role) || '/';
      navigate(redirectPath);
      
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex flex-col font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4">
        <LoginFormCard
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          onTogglePassword={togglePasswordVisibility}
          onLogin={handleLogin}
          onForgotPassword={handleForgotPassword}
          error={error}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

/* --- Visual Sub-components --- */

const Header = () => (
  <header className="w-full max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
    <div className="flex-grow flex justify-center translate-x-12">
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AskingX</h1>
    </div>
    <div className="text-sm text-gray-500 font-medium">
      <button className="hover:text-blue-600 transition-colors">ES</button>
      <span className="mx-2">|</span>
      <button className="hover:text-blue-600 transition-colors">CAT</button>
      <span className="mx-2">|</span>
      <button className="hover:text-blue-600 transition-colors">EN</button>
    </div>
  </header>
);

const LoginFormCard = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  onTogglePassword,
  onLogin,
  onForgotPassword,
  error,
  isLoading,
}) => (
  <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 border border-gray-100">
    <h2 className="text-xl font-bold text-center text-slate-800 mb-8">
      Acceso al Sistema AskingX
    </h2>

    {error && (
      <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center animate-pulse">
        {error}
      </div>
    )}

    <form onSubmit={onLogin} className="space-y-6">
      <InputField
        label="Correo Electrónico"
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ejemplo@upv.es"
        disabled={isLoading}
      />

      <PasswordField
        label="Contraseña"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        showPassword={showPassword}
        onToggleVisibility={onTogglePassword}
        disabled={isLoading}
      />

      <p className="text-xs text-gray-500 leading-relaxed">
        El sistema le redirigirá a su panel específico (Admin, Author, Connector o Giver) según sus credenciales
      </p>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full ${
          isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md flex justify-center items-center`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando sesión...
          </>
        ) : 'Iniciar Sesión'}
      </button>
    </form>

    <div className="mt-6 text-center">
      <button 
        onClick={onForgotPassword}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        ¿Olvidó su contraseña?
      </button>
    </div>
  </div>
);

const InputField = ({ label, type, id, value, onChange, placeholder, disabled }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder-gray-400 disabled:bg-gray-50"
      required
    />
  </div>
);

const PasswordField = ({ label, id, value, onChange, showPassword, onToggleVisibility, disabled }) => (
  <div className="space-y-2 relative">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 disabled:bg-gray-50"
        required
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
    </div>
  </div>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.21 5 12 5c4.789 0 8.601 3.049 9.964 6.678.07.23.07.47 0 .702C20.601 15.951 16.79 19 12 19c-4.789 0-8.601-3.049-9.964-6.678z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default Login;
