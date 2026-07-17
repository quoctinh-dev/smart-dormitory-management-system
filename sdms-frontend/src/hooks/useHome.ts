import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useHome() {
  const navigate = useNavigate();
  const [searchEmail, setSearchEmail] = useState('');

  const handleNavigateRegister = () => {
    // Truyền email sang trang đăng ký (nếu có nhập)
    navigate('/register', { state: { email: searchEmail.trim() } });
  };

  return {
    searchEmail,
    setSearchEmail,
    handleNavigateRegister,
  };
}
