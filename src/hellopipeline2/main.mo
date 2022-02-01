
import Principal "mo:base/Principal";

actor {
    
    public query({caller}) func greet(name : Text) : async Text {
        var thisTextPrincipal: Text  =  Principal.toText(caller);

        if (thisTextPrincipal != "2vxsx-fae" ) {
            return "Hello, " # name # " - Principal: " # thisTextPrincipal # "!";
        } else {
            return "Goodbye, you do not have access!";
        };
    };

    public query ({caller}) func whoami() : async Principal {
        return caller;
    };
};
