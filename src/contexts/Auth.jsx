import axios from "axios";
import React, { useState, useEffect, createContext, useContext } from "react";

import supabase from "../api/supabase";

export const Context = createContext();

export function useAuth() {
  return useContext(Context);
}

const requestNewUser = (email) => axios({
  method: 'post',
  url: 'https://scaff-m8-server.herokuapp.com/inviteuser',
  data: {
    email
  }
})

const requestDeleteUser = (email) => axios({
  method: 'post',
  url: 'https://scaff-m8-server.herokuapp.com/deleteuser',
  data: {
    email
  }
})


export const Provider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    const session = await supabase.auth.session();
    setUser(session?.user ?? null);
    setLoading(false);

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, currentSession) => {
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener?.unsubscribe();
    };
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signIn(data),
    inviteUser: (data) => requestNewUser(data),
    deleteUser: (data) => requestDeleteUser(data),
    resetPasswordForEmail: (data) => supabase.auth.api.resetPasswordForEmail(data),
    signOut: () => supabase.auth.signOut(),
    user,
  };

  return <Context.Provider value={value}>{!loading && children}</Context.Provider>;
};
