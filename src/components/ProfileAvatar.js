import React, { useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const defaultMale = 'https://randomuser.me/api/portraits/men/1.jpg';
const defaultFemale = 'https://randomuser.me/api/portraits/women/1.jpg';
const defaultGuardian = 'https://randomuser.me/api/portraits/lego/1.jpg';

const getDefaultAvatar = (gender, role) => {
  if (role === 'teacher') return '/teacher.png';
  if (role === 'student') return '/student.png';
  if (role === 'parent') return '/parent.png';
  return gender === 'female' ? '/female.png' : '/male.png';
};

const ProfileAvatar = ({ gender = 'male', src, onChange, role }) => {
  const inputRef = useRef();
  const handleClick = () => inputRef.current.click();
  const handleFile = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onChange && onChange(url, file);
    }
  };
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={src || getDefaultAvatar(gender, role)}
        alt="avatar"
        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }}
      />
      <IconButton
        size="small"
        sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#fff', boxShadow: 1 }}
        onClick={handleClick}
      >
        <PhotoCamera fontSize="small" />
      </IconButton>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
};

export default ProfileAvatar; 