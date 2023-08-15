//지역이름
$(document).ready(function () {
  $(".region_choose").on("click", function () {
    openAddressPopup();
  });

  function openAddressPopup() {
    new daum.Postcode({
      oncomplete: function (data) {
        var roadAddr = data.roadAddress; // 전체 도로명 주소
        var extraRoadAddr = ""; // 추가 주소 정보

        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraRoadAddr = data.bname;
        }

        if (data.buildingName !== "" && data.apartment === "Y") {
          extraRoadAddr +=
            extraRoadAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }

        var regionChoose = document.querySelector(".region_choose");
        regionChoose.textContent = extraRoadAddr;
      },
    }).open();
  }
});

$(document).ready(function () {
  $(".request_container").click(function () {
    window.location.href = "./solve.html"; // 실제 경로로 변경하기
  });
});

const jwtToken = sessionStorage.getItem("jwtToken");
$.ajax({
  type: "POST",
  url: "http://43.202.43.176:8080/api/user/info/",
  contentType: "application/json",
  data: JSON.stringify({
    token: jwtToken,
  }),
  success: function (response) {
    console.log(response);

    const userInfo = response; // 전체 응답 객체
    const userFields = userInfo.fields; // 사용자 정보 객체

    // 지역 이름을 가져와서 지역 요소에 적용
    const areaName = userFields.area;
    const regionChoose = document.querySelector(".region_choose");
    regionChoose.innerHTML = areaName;

    // 사용자 정보를 화면에 출력하는 로직
    console.log("이미지:", userFields.image);
    console.log("이름:", userFields.name);
    console.log("이메일:", userFields.email);
    console.log("닉네임:", userFields.nickname);
    console.log("생년월일:", userFields.date_of_birth);
    console.log("주소:", userFields.address);
    console.log("포인트:", userFields.point);
    console.log("입양 횟수:", userFields.adopt_count);
    console.log("지역:", userFields.area);
    setTimeout(function () {
      request_list();
    }, 1000);
  },
  error: function (jqXHR, textStatus, errorThrown) {
    if (jqXHR.status === 400) {
      console.error("Bad Request:", jqXHR.responseText);
      alert("올바르지 않은 형식의 입력입니다.");
    } else if (jqXHR.status === 401) {
      console.error("Unauthorized:", jqXHR.responseText);
      alert("권한이 없는 사용자입니다.");
    } else {
      console.error("Error:", jqXHR.status, errorThrown);
      alert("서버 에러");
    }
  },
});

let currentPage = 1;
const itemsPerPage = 4;
let totalPages = 0;
let currentData = [];

function request_list() {
  var area = $(".region_choose").text();

  console.log(area);
  $.ajax({
    type: "POST",
    url: "http://43.202.43.176:8080/api/post/post/",
    contentType: "application/json",
    data: JSON.stringify({
      area: area,
    }),
    success: function (response) {
      console.log(response.posts);
      currentData = response.posts;
      totalPages = Math.ceil(currentData.length / itemsPerPage);

      showPage(currentPage);

      createPaginationButtons(totalPages);
      alert("요청이 정상적으로 처리되었습니다.");
    },
    error: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 400) {
        console.error("Bad Request:", jqXHR.responseText);
        alert("올바르지 않은 형식의 입력입니다.");
      } else if (jqXHR.status === 401) {
        console.error("Unauthorized:", jqXHR.responseText);
        alert("권한이 없는 사용자입니다.");
      } else {
        console.error("Error:", jqXHR.status, errorThrown);
        alert("서버 에러");
      }
    },
  });
}

function showPage(pageNumber) {
  const startIdx = (pageNumber - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const itemsToDisplay = currentData.slice(startIdx, endIdx);

  const bestparentbox = document.querySelector(".wrap_request_container");
  bestparentbox.innerHTML = ""; // 이전에 생성된 요소들 삭제

  itemsToDisplay.forEach((element) => {
    const elements = element.fields;
    const requestContainer = createRequestContainer(
      elements.title,
      elements.point,
      elements.numChat,
      elements.content
    );
    bestparentbox.appendChild(requestContainer);
  });
}
function createPaginationButtons(totalPages) {
  const paginationContainer = document.querySelector(".request_list_footer");
  paginationContainer.innerHTML = "";

  function createPaginationButtonWithImage(imageSrc, content) {
    const button = document.createElement("a");
    button.href = "#";

    if (imageSrc) {
      const image = document.createElement("img");
      image.src = imageSrc;
      button.appendChild(image);
      button.style.display = "flex";
      button.style.justifyContent = "center";
      button.style.alignItems = "center";
    } else {
      button.textContent = content;
      button.style.display = "flex";
      button.style.justifyContent = "center";
      button.style.alignItems = "center";
      button.style.width = "2.8125rem";
      button.style.height = "3.25rem";
      button.style.fontSize = "1.5rem";
    }

    return button;
  }

  // 왼쪽 방향 버튼 생성
  const prevButton = createPaginationButtonWithImage("../img/arrow.png", "");
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
    }
  });

  paginationContainer.appendChild(prevButton);

  // 페이지 번호 버튼 생성
  const pageButtons = [];
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = createPaginationButtonWithImage("", i.toString()); // 숫자를 문자열로 변환
    pageButton.addEventListener("click", () => {
      currentPage = i;
      showPage(currentPage);
      updatePageColor();
    });

    pageButtons.push(pageButton);
    paginationContainer.appendChild(pageButton);
  }

  // 오른쪽 방향 버튼 생성
  const nextButton = createPaginationButtonWithImage(
    "../img/arrow_reverse.png",
    ""
  );
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
      updatePageColor();
    }
  });

  paginationContainer.appendChild(nextButton);

  function updatePageColor() {
    pageButtons.forEach((button, index) => {
      if (index + 1 === currentPage) {
        button.style.color = "#3a7dff"; // 선택한 페이지의 숫자에 색상 적용
      } else {
        button.style.color = ""; // 다른 페이지의 숫자는 원래 색으로 변경
      }
    });
  }

  // 초기 페이지 색상 설정
  updatePageColor();
}

// $.ajax({
//   type: "GET",
//   url: "http://43.202.43.176:8080/api/post/",
//   contentType: "application/json",
//   dataType: "json",
//   success: function (secondResponse) {
//     console.log(secondResponse);
//     alert("두 번째 요청이 정상적으로 처리되었습니다.");
//   },
//   error: function (jqXHR, textStatus, errorThrown) {
//     if (jqXHR.status === 400) {
//       console.error("Bad Request:", jqXHR.responseText);
//       alert("올바르지 않은 형식의 입력입니다.");
//     } else if (jqXHR.status === 401) {
//       console.error("Unauthorized:", jqXHR.responseText);
//       alert("권한이 없는 사용자입니다.");
//     } else {
//       console.error("Error:", jqXHR.status, errorThrown);
//       alert("서버 에러");
//     }
//   },
// });

function boxItem(element) {
  createRequestContainer(
    element.title,
    element.point,
    element.numChat,
    element.content
  );
}

function createRequestContainer(title, point, numChat, content) {
  let requestContainer = document.createElement("div");
  requestContainer.className = "request_container";

  let topContainer = document.createElement("div");
  topContainer.className = "top_container";

  let titleContainer = document.createElement("div");
  titleContainer.className = "title_container";
  let titleDiv = document.createElement("div");
  titleDiv.className = "title";
  titleDiv.textContent = title;
  titleContainer.appendChild(titleDiv);

  let pointContainer = document.createElement("div");
  pointContainer.className = "point_container";
  let pointImg = document.createElement("img");
  pointImg.src = "../img/stamp.png";
  let pointDiv = document.createElement("div");
  pointDiv.className = "point";
  pointDiv.textContent = point + "P";
  pointContainer.appendChild(pointImg);
  pointContainer.appendChild(pointDiv);

  let chatContainer = document.createElement("div");
  chatContainer.className = "chat_container";
  let chatImg = document.createElement("img");
  chatImg.src = "../img/chat.png";
  let chatDiv = document.createElement("div");
  chatDiv.className = "chatpeople";
  chatDiv.textContent = numChat + "명";
  chatContainer.appendChild(chatImg);
  chatContainer.appendChild(chatDiv);

  let contentContainer = document.createElement("div");
  contentContainer.className = "content_container";
  let contentDiv = document.createElement("div");
  contentDiv.className = "content";
  contentDiv.textContent = content;
  contentContainer.appendChild(contentDiv);

  topContainer.appendChild(titleContainer);
  topContainer.appendChild(pointContainer);
  topContainer.appendChild(chatContainer);
  requestContainer.appendChild(topContainer);
  requestContainer.appendChild(contentContainer);

  const bestparentbox = document.createElement("wrap_request_container");
  return bestparentbox.appendChild(requestContainer);
}