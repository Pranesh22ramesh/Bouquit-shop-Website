import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
export default function PasswordInput({ id, label = 'Password', ...props }) {
  const [visible, setVisible] = useState(false);
  return <div className="field"><label htmlFor={id}>{label}</label><div className="password-field"><input {...props} id={id} type={visible ? 'text' : 'password'} maxLength={100} /><button className="icon-button" type="button" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <FiEyeOff /> : <FiEye />}</button></div></div>;
}
