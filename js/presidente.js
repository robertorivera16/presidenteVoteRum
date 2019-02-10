  var config = {
  	apiKey: "AIzaSyBi-b7XvOWghU0Sres2GZRnSAy-aj3UcjE",
  	authDomain: "votoelectronico-uprm.firebaseapp.com",
  	databaseURL: "https://votoelectronico-uprm.firebaseio.com",
  	projectId: "votoelectronico-uprm",
  	storageBucket: "",
  	messagingSenderId: "327811555356"
  };
  firebase.initializeApp(config);

  function initApp(){
  	document.getElementById('signInbtn')
  	.addEventListener('click', signInUser);

  	if(!firebase.auth().currentUser){

  	}


  }

  window.onload = function() {
  	initApp();
  }

      /*The onAuthStateChanged runs whenever there is a change in user accounts.
      Loging in or out will trigger it.*/
      firebase.auth().onAuthStateChanged(function(user) {
      	if (user) {
          // User is signed in.
          document.getElementById('CurrentUserP').innerText = user.email + ' is signed in.';
          
        } else {
          // No user is signed in.
          document.getElementById('CurrentUserP').innerText = 'No user is signed in.';
        }
      });


      /*Sign in function, will only run when there is no user logged in.*/
      function signInUser(){

      	var email = document.getElementById('emailUserInput').value;
      	var password = document.getElementById('passwordUserInput').value;

      	if(firebase.auth().currentUser == null){

      		firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){

      			if (user) {
                // User is signed in.
                
              } else {
                // No user is signed in.
              }


            }).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              
              alert('Sign in unsuccesful, Error: ' + error.code);

              
            });
          } else{
           alert('User currently logged in.');
         }
       }

       function signOutUser(){
         firebase.auth().signOut().then(function(){
          //SignOut Succesfull.
          alert('User signed out succesfully.');

        }, function(error){
          //Something Went Wrong.
          alert('Sign out unsuccesful. Error: ' + error.code);
        });
       }

       var dbEstadoVotacional = firebase.database().ref().child('EstadoVotacional');
       var EstadoVotacional = false;
       var estadoVotacionalBtn = document.getElementById('estadoVotacionalBtn');
       var dbStudents = firebase.database().ref().child('Students');


       dbEstadoVotacional.on('value', function(snapshot){
         EstadoVotacional = snapshot.val();
         if(EstadoVotacional){
          estadoVotacionalBtn.innerText = 'Detener Votacion';
        } else { 
          estadoVotacionalBtn.innerText = 'Empezar Votacion';
        }
      });



       var countFavor = 0;
       var countContra = 0;
       var countAbstenido = 0;
       var total = 0;
    //Function for turning voting permission on/off.
    function countVotes(){
      countFavor = 0;
      countAbstenido = 0;
      countContra = 0;
      total = 0;

      dbStudents.once('value', function(snapshot){
        snapshot.forEach(function(child){
         var voto = firebase.database().ref().child('Students').child(child.key).child('RequestVal');

         voto.once('value', function(value){
          switch(value.val()){
            case 'none': 
            break;
            case 'Favor':
            countFavor = countFavor + 1;
            //console.log("Favor");
            break;
            case 'Contra':
            countContra = countContra + 1;
            //console.log("Contra");
            break;
            case 'Abstenido':
            countAbstenido = countAbstenido + 1;
            console.log("Abstenido");
            break;
            default:
            //console.log("No paso nada ERROR");
          }
        });
       })

      });
    }

    var fieldFavor = document.getElementById('FavorCount');
    var fieldAbstenido = document.getElementById('AbstenidoCount');
    var fieldContra = document.getElementById('ContraCount');
    var fieldTotal = document.getElementById('TotalCount');

    function escrutinio(){


      total = countFavor + countContra + countAbstenido;

      // console.log(countFavor);
      // console.log(countContra);
      // console.log(countAbstenido);
      // console.log(total);

      fieldFavor.innerText = countFavor;
      fieldContra.innerText = countContra;
      fieldAbstenido.innerText = countAbstenido;
      fieldTotal.innerText = total;
    }



    function apagarOprenderVotos(){

    	if(firebase.auth().currentUser){

        //Reads the value in the server, in case the user changed it in the console.
        dbEstadoVotacional.once('value', function(snapshot){
        	if (snapshot.val()) {
        		dbEstadoVotacional.set(false);
            countVotes();
          } else {
            dbEstadoVotacional.set(true);
          }
        });

      } else {
       alert('User must be signed in.');
     }


   }



    //Setting refference for Mocion
    var dbMocionValue = firebase.database().ref().child('MocionValue');

    //Lisening for value on Mocion
    var MocionValue = document.getElementById('MocionValue');
    dbMocionValue.on('value', function(snapshot){
    	MocionValue.innerText = snapshot.val();
    });



    //Function for changing the mocion that appears in the system.
       //Verifies that the vote taking is inactive, to avoid changing the mocion while voting is taking place.
       function CambiarMocion(){

       	if(firebase.auth().currentUser){
        //Reads the value in the server, in case the user changed it in the console.
        dbEstadoVotacional.once('value', function(snapshot){
        	if (snapshot.val()){
            //Voting is Active.
            $.alert('La votacion debe estar cerrada para cambiar la mocion.');
          } else {
            //Voting is Closed.
            var mocionNueva = prompt("Por favor escribe la nueva mocion:", "Nueva Mocion");
            dbMocionValue.set(mocionNueva);
          }
        });
      } else{
        alert('No user logged in.');
     }


   }

    //Seting reference for vote count.
    var dbVotosFavor = firebase.database().ref().child('Votes').child('Favor');
    var dbVotosContra = firebase.database().ref().child('Votes').child('Contra');
    var dbVotosAbstenido = firebase.database().ref().child('Votes').child('Abstenido');

    //Delete all votes
    function deleteVotes(){

    	if(firebase.auth().currentUser){
        //Reads the value in the server, in case the user changed it in the console.
        dbEstadoVotacional.once('value', function(snapshot){
        	if (snapshot.val()){
            //Voting is Active.
            alert('La votacion debe estar cerrada para borrar los votos.');
          } else {
            //Voting is Closed.
            dbVotosContra.set(0);
            dbVotosAbstenido.set(0);
            dbVotosFavor.set(0);

            countFavor = 0;
            countAbstenido = 0;
            countContra = 0;
            total = 0;
            
            fieldFavor.innerText = 0;
            fieldContra.innerText = 0;
            fieldAbstenido.innerText = 0;
            fieldTotal.innerText = 0;

            resetHasVoted();

          } 
        });
      } else{
       alert('No user logged in.');
     }



   }

   

   function resetHasVoted(){
     dbStudents.once('value', function(snapshot){
      snapshot.forEach(function(child){
       // console.log(child.key + " : " + child.val());
       firebase.database().ref().child('Students').child(child.key).child('RequestVal').set('none');
       firebase.database().ref().child('Students').child(child.key).child('HasVoted').set(false);

          //child.ref().update({HasVoted: false, RequestVal: false});
        });

    });
   }