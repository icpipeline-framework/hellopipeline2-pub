//import { hellopipeline2 } from "../../declarations/hellopipeline2";

import { hellopipeline2, idlFactory as hellopipeline2Idl, canisterId as hellopipeline2CanisterId} from "../../declarations/hellopipeline2";


import { AuthClient } from "@dfinity/auth-client";

import { DelegationIdentity } from "@dfinity/identity";
import { Actor, HttpAgent } from '@dfinity/agent';

/// set const to the elements

const helloMainEl = document.getElementById("helloMain");
const notLoggedInEl = document.getElementById("notLoggedIn");


const principalEl = document.getElementById("principal");
const delegationEl = document.getElementById("delegation");
const expirationEl = document.getElementById("expiration");
const iiUrlEl = document.getElementById("iiUrl");

const signInBtn = document.getElementById("signinBtn");
const signOutBtn = document.getElementById("signoutBtn");

//const maxTimeToLiveEl = document.getElementById("maxTimeToLive");
const maxTimeToLiveEl = 0;



let authClient;

console.log ("window.location.hostname: ", window.location.hostname); 

var thishostname = window.location.hostname ;


const thisHostArray = thishostname.split(".");

var thisIIHost = `${thisHostArray[0]}.ii.replicator.icpipeline.com`;


let hellopipeline2II = "https://"+thisIIHost+""
// now we create the check for the page

const init = async () => {
  authClient = await AuthClient.create();

  const updateView = () => {
    const identity = authClient.getIdentity();

    principalEl.innerText = identity.getPrincipal();
    if (identity instanceof DelegationIdentity) {
      delegationEl.innerText = JSON.stringify(identity.getDelegation().toJSON(), undefined, 2);

      // cannot use Math.min, as we deal with bigint here
      const nextExpiration =
        identity.getDelegation().delegations
         .map(d => d.delegation.expiration)
         .reduce((current, next) => next < current ? next : current);
      var thisExpirationNs = nextExpiration - BigInt(Date.now()) * BigInt(1000_000);
      console.log ("nextExpiration: "+nextExpiration) ;
      console.log ("Date.now(): "+Date.now()) ;
      var thisExpirationMin = thisExpirationNs/BigInt(60)/BigInt(1_000)/BigInt(1000_000);
      expirationEl.innerText = thisExpirationMin+" mins ("+thisExpirationNs+"ns)"
      helloMainEl.style.display = "block";
      notLoggedInEl.style.display = "none";
    } else {
      helloMainEl.style.display = "none";
      notLoggedInEl.style.display = "block";
      delegationEl.innerText = "Current identity is not a DelegationIdentity";
      expirationEl.innerText = "N/A";
    }
  }

  updateView();

  signInBtn.onclick = async () => {
    if (BigInt(maxTimeToLiveEl) > BigInt(0)) {
      authClient.login({
        identityProvider:  hellopipeline2II,
        maxTimeToLive: BigInt(maxTimeToLiveEl),
        onSuccess: updateView
      })
    } else {
      authClient.login({
        identityProvider: hellopipeline2II,
        onSuccess: updateView
      });
    }
  };

  signOutBtn.onclick = async () => {
    authClient.logout();
    updateView();
  };
}; //end init 

init();


// Autofills the <input> for the II Url to point to our hellopipeline2II.
document.body.onload = () => {
  //const hellopipeline2II = "https://rdmx6-jaaaa-aaaaa-aaadq-cai.identity.dfinity.network/"
  //const hellopipeline2II = "http://localhost:9000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai";
  
  document.getElementById("iiUrl").value = hellopipeline2II;
  document.getElementById("iiUrlDisplay").innerText = hellopipeline2II;

};

changeIiUrl.onclick = async () => {
  hellopipeline2II = document.getElementById("iiUrl").value
  document.getElementById("iiUrl").value = hellopipeline2II;
  document.getElementById("iiUrlDisplay").innerText = hellopipeline2II;
};

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = e.target.querySelector("button");

  const name = document.getElementById("name").value.toString();

  button.setAttribute("disabled", true);
  
    
  let identity = authClient.getIdentity(); 

  let agent = new HttpAgent({ identity });
  
  

  if(process.env.NODE_ENV !== "production") {
    agent.fetchRootKey().catch(err=>{
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }// end if production 


  // Interact with foo actor, calling the greet method
  let hellopipeline2Actor = Actor.createActor(hellopipeline2Idl, { agent, canisterId: hellopipeline2CanisterId });
  const greeting = await hellopipeline2Actor.greet(name);

  button.removeAttribute("disabled");

  document.getElementById("greeting").innerText = greeting;

  return false;
});
