// ... imports

const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. MANUAL INSERT (This is the critical part!)
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: 'borrower'
          }
        ]);
        
      if (profileError) console.error(profileError); // Log it but don't stop
    }

    alert("Registration Successful!");
    navigate("/login");

  } catch (error) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
// ... rest of the UI