import React, { useState, useRef } from "react";
import { supabase } from "../lib/SupabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    occupation: "",
    nrcNumber: "",
    ec1Name: "", ec1Rel: "", ec1Phone: "",
    ec2Name: "", ec2Rel: "", ec2Phone: "",
    password: "",
    confirmPassword: ""
  });

  // --- FILE STATES ---
  const [files, setFiles] = useState({
    nrcFront: null,
    nrcBack: null,
    selfie: null
  });

  // Helper to handle text changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to handle file selection
  const handleFileChange = (e, key) => {
    if (e.target.files[0]) {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match!");
    if (!files.nrcFront || !files.nrcBack || !files.selfie) return alert("Please upload all required ID documents.");

    setLoading(true);

    try {
      // 1. Sign Up User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName } // Initials triggers profile creation
        }
      });

      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Registration failed. Please try again.");

      // 2. Upload Files
      const uploadFile = async (file, type) => {
        const fileName = `${userId}/${type}_${Date.now()}_${file.name}`;
        const { error: upError } = await supabase.storage.from('kyc_documents').upload(fileName, file);
        if (upError) throw upError;
        const { data: urlData } = supabase.storage.from('kyc_documents').getPublicUrl(fileName);
        return urlData.publicUrl;
      };

      const nrcFrontUrl = await uploadFile(files.nrcFront, 'nrc_front');
      const nrcBackUrl = await uploadFile(files.nrcBack, 'nrc_back');
      const selfieUrl = await uploadFile(files.selfie, 'selfie');

      // 3. Update Profile with Full Details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          occupation: formData.occupation,
          nrc_number: formData.nrcNumber,
          nrc_front_url: nrcFrontUrl,
          nrc_back_url: nrcBackUrl,
          selfie_url: selfieUrl,
          emergency_contact_1: { name: formData.ec1Name, relation: formData.ec1Rel, phone: formData.ec1Phone },
          emergency_contact_2: { name: formData.ec2Name, relation: formData.ec2Rel, phone: formData.ec2Phone }
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      alert("Account Created Successfully! Please Login.");
      navigate("/login");

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const inputStyle = "w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none";
  const labelStyle = "block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide";
  const sectionTitleStyle = "text-sm font-bold text-indigo-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-10 px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <Link to="/login" className="text-gray-400 text-xs hover:text-indigo-600 mb-4 block">
            &lt; Back to Login
          </Link>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full mb-3">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm">Register to access Dunku Loans services.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          
          {/* 1. Personal Details */}
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelStyle}>Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></span>
                  <input type="text" name="fullName" placeholder="John Doe" className={`${inputStyle} pl-10`} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg></span>
                  <input type="text" name="phone" placeholder="+260 97..." className={`${inputStyle} pl-10`} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="mb-4">
               <label className={labelStyle}>Email Address</label>
               <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></span>
                  <input type="email" name="email" placeholder="you@example.com" className={`${inputStyle} pl-10`} onChange={handleChange} required />
               </div>
            </div>

            <div className="mb-4">
               <label className={labelStyle}>Residential Address</label>
               <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></span>
                  <input type="text" name="address" placeholder="House No, Street, City" className={`${inputStyle} pl-10`} onChange={handleChange} required />
               </div>
            </div>

            <div className="mb-4">
               <label className={labelStyle}>Occupation</label>
               <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></span>
                  <input type="text" name="occupation" placeholder="Job Title" className={`${inputStyle} pl-10`} onChange={handleChange} required />
               </div>
            </div>
          </div>

          {/* 2. Identity Verification */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <h3 className={sectionTitleStyle}>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884-.56 1.6-1.375 1.933M16 11.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path></svg>
               Identity Verification
             </h3>
             <div className="mb-4">
                <label className={labelStyle}>NRC Number</label>
                <input type="text" name="nrcNumber" placeholder="123456/11/1" className={`${inputStyle} bg-white text-gray-900 border-gray-300`} onChange={handleChange} required />
             </div>
             
             <label className={labelStyle}>Upload NRC & Selfie (Required)</label>
             <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-3 text-center hover:bg-gray-50 relative">
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'nrcFront')} required />
                   <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                   <p className="text-[10px] text-gray-500 font-bold">{files.nrcFront ? "✓ Front Selected" : "NRC Front"}</p>
                </div>
                <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-3 text-center hover:bg-gray-50 relative">
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'nrcBack')} required />
                   <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                   <p className="text-[10px] text-gray-500 font-bold">{files.nrcBack ? "✓ Back Selected" : "NRC Back"}</p>
                </div>
             </div>
             <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-3 text-center hover:bg-gray-50 relative">
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'selfie')} required />
                 <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                 <p className="text-[10px] text-gray-500 font-bold">{files.selfie ? "✓ Selfie Selected" : "Upload a Selfie"}</p>
             </div>
          </div>

          {/* 3. Emergency Contacts */}
          <div className="pt-2">
             <h3 className="text-sm font-bold text-purple-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Emergency Contact Details (2 Required)
             </h3>
             
             {/* Contact 1 */}
             <div className="mb-4">
               <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Emergency Contact 1</p>
               <div className="grid grid-cols-2 gap-3 mb-2">
                  <input type="text" name="ec1Name" placeholder="Full Name" className={`${inputStyle} bg-gray-50 text-gray-900 border-gray-200`} onChange={handleChange} required />
                  <input type="text" name="ec1Rel" placeholder="Relationship" className={`${inputStyle} bg-gray-50 text-gray-900 border-gray-200`} onChange={handleChange} required />
               </div>
               <input type="text" name="ec1Phone" placeholder="Mobile Money Number" className={`${inputStyle} bg-gray-50 text-gray-900 border-gray-200`} onChange={handleChange} required />
             </div>

             {/* Contact 2 */}
             <div>
               <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Emergency Contact 2</p>
               <div className="grid grid-cols-2 gap-3 mb-2">
                  <input type="text" name="ec2Name" placeholder="Full Name" className={`${inputStyle} bg-gray-50 text-gray-900 border-gray-200`} onChange={handleChange} required />
                  <input type="text" name="ec2Rel" placeholder="Relationship" className={`${inputStyle} bg-gray-50 text-gray-900 border-gray-200`} onChange={handleChange} required />
               </div>
               <input type="text" name="ec2Phone" placeholder="Mobile Money Number" className={`${inputStyle} bg-gray-50 text-gray-900 border-gray-200`} onChange={handleChange} required />
             </div>
          </div>

          {/* 4. Password */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></span>
                  <input type="password" name="password" placeholder="••••••••" className={`${inputStyle} pl-10`} onChange={handleChange} required />
                </div>
              </div>
              <div>
                 <label className={labelStyle}>Confirm</label>
                 <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></span>
                    <input type="password" name="confirmPassword" placeholder="••••••••" className={`${inputStyle} pl-10`} onChange={handleChange} required />
                 </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
               <input type="checkbox" required className="rounded text-indigo-600 focus:ring-indigo-500" />
               <span className="text-xs text-gray-600">I agree to Dunku Loans' Terms of Service and Privacy Policy.</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? (
               "Creating Account..."
            ) : (
               <>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Complete Registration
               </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}