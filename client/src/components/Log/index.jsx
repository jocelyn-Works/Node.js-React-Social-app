import React, { useState} from "react";
import SignUpForm from "./SignUpForm";
import SignInForm from "./SignInForm";

const Log = ( props ) => {
  const [signUpModal, setSignUpModal] = useState(props.signup);
  const [signInModal, setSignInModal] = useState(props.signin);

  const handleModal = (e) => {
    if (e.target.id === "register") {
        setSignInModal(false);
        setSignUpModal(true);
    }else if  (e.target.id === "login") {
        setSignInModal(true);
        setSignUpModal(false);
    }
  }

  return (
    <div className="connection-form">
      <div className="form-container">
        <ul>
          <li 
            onClick={handleModal}
            id="register"
            className={signUpModal ? "active-btn" : null}>S'Inscrire</li>
          <li
           onClick={handleModal}
            id="login"
            className={signInModal ? "active-btn" : null}>Se Connecter</li>
        </ul>
        {signUpModal && <SignUpForm />}
        {signInModal && <SignInForm />}
      </div>
    </div>
  );
};

export default Log;
