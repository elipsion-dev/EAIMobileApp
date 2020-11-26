$("#page2").hide();
$("#page3").hide();
$("#sub").hide();
$("#uploading").hide();
$("#success").hide();
const app = {
  initialize: function () {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
      document.addEventListener("deviceready", this.onDeviceReady, false);
    } else {
      this.onDeviceReady();
    }
  },

  onDeviceReady: function () {
    let report = {
        pics: [],
      },
      picsTaken = 1;

    //------******------
    //-----PAGE 1-------
    //------******------

    //page 1 visit btns
    $("#newVisit").on("click", function () {
      report.visit = "New Visit";
      $(".btns").removeClass("btn-success");
      $("#newVisit").addClass("btn-success");
    });
    $("#returnVisit").on("click", function () {
      report.visit = "Return Visit";
      $(".btns").removeClass("btn-success");
      $("#returnVisit").addClass("btn-success");
    });

    //page 1 contractor select box
    $("#contractor").on("change", function () {
        console.log('clicked on contractor')
      let e = document.getElementById("contractor");
      let subNum = e.options[e.selectedIndex].text;
      $.ajax({
        type: "GET",
        url: `https://EAIservices.elipsion.repl.co/subs/${subNum}`, //change according
        success: function (data) {
          console.log(data);
          report.contractor = data.name;
          data.locations.forEach(function (loc) {
            $("#locations").append(`<option value="${loc}">${loc}</option>`);
          });
        },
        error: function (e) {
          alert("Error:" + e);
        },
      });
    });

    //page 1 continue button
    $("#continue1").on("click", function () {
      console.log(report.visit, report.contractor);
      if (report.visit && report.contractor) {
        $("#page1").hide();
        $("#page2").fadeIn();
      } else alert("Please select a Visit Type AND a Contractor ID");
    });

    //------******------
    //-----PAGE 2-------
    //------******------

    //page 2 work functions
    $(".checks").on("change", function () {
      $("input:checkbox").each(function () {
        report[$(this).attr("id")] = true;
      });
      console.log(report);
    });

    //page 2 locations select box
    $("#locations").on("change", function () {
      let e = document.getElementById("locations");
      let locationName = e.options[e.selectedIndex].text;
      report.location = locationName;
      console.log(report);
    });

    //page 2 snow amount select box
    $("#snow").on("change", function () {
      let e = document.getElementById("snow");
      let snowAmt = e.options[e.selectedIndex].text;
      report.snow = snowAmt;
      console.log(report);
    });

    //page 2 continue btn
    $("#continue2").on("click", function () {
      let date = new Date();
      report.date = date.toString();
      console.log(report);
      if (
        (report.saltedParkingLot && report.snow && report.location) ||
        (report.saltedSidewalks && report.snow && report.location) ||
        (report.shoveledSidewalks && report.snow && report.location) ||
        (report.plowedParkingLot && report.snow && report.location)
      ) {
        $.post(
          "https://EAIservices.elipsion.repl.co/data", // url
          report, // data to be submit
          function (data, status, jqXHR) {
            console.log(data, status, jqXHR);
          }
        );
        $("#page2").hide();
        $("#page3").fadeIn();
      } else alert("Please select Work Completed, Snow Amount, & Location");
    });

    //------******------
    //-----PAGE 3-------
    //------******------

    //page 3 submit button
    $("#submit").on("click", function () {
      var items = report.pics;
      jQuery.get("https://EAIservices.elipsion.repl.co");
      //loop thru pic uris in items array and run uploadToServer on each
      for (let i = 0; i < items.length; i++) {
        uploadToServer(`Pic${i}`, items[i]);
      }
      $("#page3").hide();
      $("#uploading").fadeIn();
      setTimeout(function () {
        $("#uploading").fadeOut();
        $("#success").fadeIn();
      }, 2000);
      setTimeout(function () {
        location.reload();
      }, 5000);
    });

    //page 3 open camera btn
    $("#camera").on("click", function () {
      if (picsTaken < 5) openCamera();
    });

    //open the camera on pic block click too
    $(".picBlock").on("click", function () {
      if (!$(this).prop("src") && picsTaken < 5) openCamera();
    });

    //camera plugin
    function openCamera() {
      let srcType = Camera.PictureSourceType.CAMERA;
      let options = setOptions(srcType);
      // let func = createNewFileEntry;

      navigator.camera.getPicture(
        function cameraSuccess(imageUri) {
          report.pics.push(imageUri);
          $(`#pic${picsTaken}`).attr("src", imageUri);
          picsTaken += 1;
          if (picsTaken === 5) {
            $("#sub").fadeIn();
            $("#camera").off("click");
            $(".picBlock").off("click");
          }
        },
        function cameraError(error) {
          console.debug("Unable to obtain picture: " + error, "app");
        },
        options
      );
    }

    //camera options
    function setOptions(srcType) {
      let options = {
        // Some common settings are 20, 50, and 100
        saveToPhotoAlbum: false,
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true, //Corrects Android orientation quirks
      };
      return options;
    }

    //file transfer plugin - upload pics to server
    function uploadToServer(pictureName, fileURI) {
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.mimeType = "image/jpeg";
      options.fileName = pictureName;
      options.chunkedMode = false;

      var ft = new FileTransfer();
      ft.upload(
        fileURI,
        "https://EAIservices.elipsion.repl.co/report",
        function (res) {
          console.log("Code = " + res.responseCode);
        },
        function (error) {
          $log.debug(error);
          alert("An error has occurred: Code = " + error.code);
        },
        options
      );
    }
  }, //end device ready
}; //end app
app.initialize();
$("#page2").hide();
$("#page3").hide();
$("#sub").hide();
$("#uploading").hide();
$("#success").hide();
let report = {
    pics: [],
  },
  picsTaken = 1;

document.addEventListener("deviceready", deviceReady, false);

function deviceReady(source) {
  console.log('device ready called by ' + source)
  if (source === "pic1") picBlock1();
  if (source === "pic2") picBlock2();
  if (source === "pic3") picBlock3();
  if (source === "pic4") picBlock4();
  if (source === "camera") cameraFunc();
  if (source === "submit") submit();

  //------******------
  //-----PAGE 3-------
  //------******------

  //page 3 submit button
  function submit() {
    var items = report.pics;
    jQuery.get("https://EAIservices.elipsion.repl.co");
    //loop thru pic uris in items array and run uploadToServer on each
    for (let i = 0; i < items.length; i++) {
      uploadToServer(`Pic${i}`, items[i]);
    }
    $("#page3").hide();
    $("#uploading").fadeIn();
    setTimeout(function () {
      $("#uploading").fadeOut();
      $("#success").fadeIn();
    }, 2000);
    setTimeout(function () {
      location.reload();
    }, 5000);
  }

  //page 3 open camera btn
  function cameraFunc() {
    console.log('cameraFunc called')
    if (picsTaken < 5) openCamera();
  }

  //empty pic placeholder onclick functions
  function picBlock1() {
    if (!$("#pic1").prop("src") && picsTaken < 5) openCamera();
  }
  function picBlock2() {
    if (!$("#pic2").prop("src") && picsTaken < 5) openCamera();
  }
  function picBlock3() {
    if (!$("#pic3").prop("src") && picsTaken < 5) openCamera();
  }
  function picBlock4() {
    if (!$("#pic4").prop("src") && picsTaken < 5) openCamera();
  }
  //camera plugin
  function openCamera() {
    console.log('openCamera was called')
    console.log(navigator.camera)
    let srcType = Camera.PictureSourceType.CAMERA;
    let options = setOptions(srcType);
    // let func = createNewFileEntry;

    navigator.camera.getPicture(
      function cameraSuccess(imageUri) {
        report.pics.push(imageUri);
        $(`#pic${picsTaken}`).attr("src", imageUri);
        picsTaken += 1;
        if (picsTaken === 5) {
          $("#sub").fadeIn();
        }
      },
      function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");
      },
      options
    );
  } //end device ready

  //camera options
  function setOptions(srcType) {
    let options = {
      // Some common settings are 20, 50, and 100
      saveToPhotoAlbum: false,
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      // In this app, dynamically set the picture source, Camera or photo gallery
      sourceType: srcType,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: false,
      correctOrientation: true, //Corrects Android orientation quirks
    };
    return options;
  }

  //file transfer plugin - upload pics to server
  function uploadToServer(pictureName, fileURI) {
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.mimeType = "image/jpeg";
    options.fileName = pictureName;
    options.chunkedMode = false;

    var ft = new FileTransfer();
    ft.upload(
      fileURI,
      "https://EAIservices.elipsion.repl.co/report",
      function (res) {
        console.log("Code = " + res.responseCode);
      },
      function (error) {
        $log.debug(error);
        alert("An error has occurred: Code = " + error.code);
      },
      options
    );
  }
}

//------******------
//-----PAGE 1-------
//------******------

//page 1 visit btns
function newVisitFunc() {
  report.visit = "New Visit";
  $(".btns").removeClass("btn-success");
  $("#newVisit").addClass("btn-success");
}

function returnVisitFunc() {
  report.visit = "Return Visit";
  $(".btns").removeClass("btn-success");
  $("#returnVisit").addClass("btn-success");
}

function contractorFunc() {
  let e = document.getElementById("contractor");
  let subNum = e.options[e.selectedIndex].text;
  $.ajax({
    type: "GET",
    url: `https://EAIservices.elipsion.repl.co/subs/${subNum}`, //change according
    success: function (data) {
      console.log(data);
      report.contractor = data.name;
      data.locations.forEach(function (loc) {
        $("#locations").append(`<option value="${loc}">${loc}</option>`);
      });
    },
    error: function (e) {
      alert("Error:" + e);
    },
  });
}

//page 1 continue button
function continue1() {
  if (report.visit && report.contractor) {
    $("#page1").hide();
    $("#page2").fadeIn();
  } else alert("Please select a Visit Type AND a Contractor ID");
}

//------******------
//-----PAGE 2-------
//------******------

//page 2 work functions
function saltedParkingLot() {
  if ($("#saltedParkingLot").prop('checked')) {
    console.log('checked salted parking lot')
    report.saltedParkingLot = true;
  } else report.saltedParkingLot = false;
}
function saltedSidewalks() {
  if ($("#saltedSidewalks").prop('checked')) {
    console.log('checked salted parking lot')
    report.saltedSidewalks = true;
  } else report.saltedSidewalks = false;
}
function plowedParkingLot() {
  if ($("#plowedParkingLot").prop('checked')) {
    console.log('checked salted parking lot')
    report.plowedParkingLot = true;
  } else report.plowedParkingLot = false;
}
function shoveledSidewalks() {
  if ($("#shoveledSidewalks").prop('checked')) {
    console.log('checked salted parking lot')
    report.shoveledSidewalks = true;
  } else report.shoveledSidewalks = false;
}

//page 2 locations select box
function locationFunc() {
  let e = document.getElementById("locations");
  let locationName = e.options[e.selectedIndex].text;
  report.location = locationName;
  console.log(report)
}

//page 2 snow amount select box
function snowFunc() {
  let e = document.getElementById("snow");
  let snowAmt = e.options[e.selectedIndex].text;
  report.snow = snowAmt;
  console.log(report)
}

//page 2 continue btn
function continue2() {
  let date = new Date();
  report.date = date.toString();
  console.log(report)
  if (
    (report.saltedParkingLot && report.snow && report.location) ||
    (report.saltedSidewalks && report.snow && report.location) ||
    (report.shoveledSidewalks && report.snow && report.location) ||
    (report.plowedParkingLot && report.snow && report.location)
  ) {
    $.post(
      "https://EAIservices.elipsion.repl.co/data", // url
      report, // data to be submit
      function (data, status, jqXHR) {
        console.log(data, status, jqXHR);
      }
    );
    $("#page2").hide();
    $("#page3").fadeIn();
  } else alert("Please select Work Completed, Snow Amount, & Location");
}
