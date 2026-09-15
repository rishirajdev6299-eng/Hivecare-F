import { useEffect, useState } from "react";
import{useNavigate}from"react-router-dom";
import "./Profile.css";
import {
getUserById,
updateUser
}
from "../../api/api";

function Profile(){
const navigate=useNavigate();
const user=JSON.parse(
localStorage.getItem("user"));

const [profile,setProfile]=useState({

name:"",
email:"",
phone:"",
address:"",
password:""

});

useEffect(()=>{

getUserById(user.id)

.then(res=>{

setProfile(res.data);

});

},[]);

const handleChange=(e)=>{

setProfile({

...profile,

[e.target.name]:e.target.value

});

};

const handleSubmit=async(e)=>{

e.preventDefault();

const res=await updateUser(

user.id,

profile

);

/* localStorage.setItem(

"user",

JSON.stringify(res.data)

); */

alert("Profile Updated");
navigate("/");
};

return(

  <div
    className="container d-flex justify-content-center align-items-center"
    style={{ minHeight: "90vh" }}
  >
    <div
      className="card shadow-lg border-0"
      style={{
        maxWidth: "700px",
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <div
        className="card-header text-center bg-primary text-white"
        style={{
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        <i
          className="bi bi-person-circle"
          style={{ fontSize: "70px" }}
        ></i>

        <h3 className="mt-2 mb-0">
          My Profile
        </h3>

        <small>
          Manage your personal information
        </small>
      </div>

      <div className="card-body p-4">

        <form onSubmit={handleSubmit}>

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Full Name
              </label>

              <input
                type="text"
                className="form-control"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                name="email"
                value={profile.email}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Phone Number
              </label>

              <input
                type="tel"
                className="form-control"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Address
              </label>

              <input
                type="text"
                className="form-control"
                name="address"
                value={profile.address}
                onChange={handleChange}
              />

            </div>

            <div className="col-12 mb-4">

              <label className="form-label">
                Password
              </label>

              <input
                type="new-password"
                className="form-control"
                name="password"
                value={profile.password}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="d-grid">

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                borderRadius: "12px",
              }}
            >
              <i className="bi bi-check-circle me-2"></i>

              Update Profile

            </button>

          </div>

        </form>

      </div>
    </div>
  </div>

);

}

export default Profile;