const USER_NAME_KEY = 'collab_notes_user_name';

export const saveUserName = (name) => {
  if (name && name.trim()) {
    localStorage.setItem(USER_NAME_KEY, name.trim());
  }
};

export const getUserName = () => {
  return localStorage.getItem(USER_NAME_KEY) || '';
};