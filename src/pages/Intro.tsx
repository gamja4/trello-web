import { useEffect } from "react";
import axios from "../../node_modules/axios/index";
import { useNavigate } from "../../node_modules/react-router-dom/dist/index";
import "./style.css"

function Intro() {

  const navigate = useNavigate();

  function resetClass(element, classname){
    element.classList.remove(classname);
  }


  // 2 => 로그인 1 => 회원가입
  useEffect(() => {    

    // status 저장
    document.getElementById("submit-btn").status = 2;


    document.getElementsByClassName("show-signup")[0].addEventListener("click",function(){
      let form = document.getElementsByClassName("form")[0];
      resetClass(form, "signin");
      form.classList.add("signup");
      document.getElementById("submit-btn").innerText = "Sign Up";
      document.getElementById("submit-btn").status = 1;
    });
    
    document.getElementsByClassName("show-signin")[0].addEventListener("click",function(){
      let form = document.getElementsByClassName("form")[0];
      resetClass(form, "signup");
      form.classList.add("signin");
      document.getElementById("submit-btn").innerText = "Sign In";
      document.getElementById("submit-btn").status = 2;

    });

  }, [])


  const callApi = async (uri: string, method: 'get' | 'post' | 'put' | 'delete', body?: any, func?: any) => {
    const url = `http://localhost:8080/api${uri}`;

    try {
        const res = await axios({
            url: url,
            method: method,
            data: body,
        });

        if (func) func(res.data);
        return res.data;
    } catch (error) {
        throw new Error('API Request Error: ' + error.message);
    }
  };

  const handleClick = async (e) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const nickname = document.getElementById("nickname").value;

    const currentStatus = e.currentTarget.status;
    console.log(e);
    // 로그인일 때
    if (currentStatus === 2) {
      const req = {
        email: email,
        password: password
      }

      const res = await callApi('/auth/login', 'post', req);
      if (res.status !== 201) {
        alert(res.msg);
      }
      window.sessionStorage.setItem("accessToken", res.data.accessToken);
      window.sessionStorage.setItem("refreshToken", res.data.refreshToken);
      navigate('/boards');
      return;
    }

    // 회원가입일 때
    if (currentStatus === 1) {     
      const req = {
        email: email,
        password: password,
        nickname: nickname
      }

      const res = await callApi('/users/signup', 'post', req);
      alert(res.msg);
    } 
  }

  return (
    <div className="form signin">
      <div className="form-header">
        <div className="show-signup">Sign Up</div>
        <div className="show-signin">Sign In</div>
      </div>
      <div className="arrow"></div>
      <div className="form-elements">
        <div className="form-element">
          <input id="email" type="email" placeholder="Email" />
        </div>
        <div className="form-element">
          <input id="password" type="password" placeholder="Password" />
        </div>
        <div className="form-element">
          <input id="nickname" type="text" placeholder="Nickname" />
        </div>
        <div className="form-element">
          <button id="submit-btn" onClick={handleClick}>Sign In</button>
        </div>
      </div>
    </div>
  );  
}
export default Intro;