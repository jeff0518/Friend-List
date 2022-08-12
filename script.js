// 宣告
const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";
const userBox = [];
let filteredPhoto = [];
const userClickStatus = JSON.parse(localStorage.getItem("userClickStatus")) || []

const favoriteBall = document.querySelector('.favorite-ball')
const photoUser = document.querySelector(".photo-user");
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const paginator = document.querySelector("#paginator");

const PHOTO_PER_PAGE = 12;

// <!-- navbar -->
// Myfavorites旁顯示好友數量
if (!JSON.parse(localStorage.getItem('favorite'))) {
	favoriteBall.innerText = 0
} else (
	favoriteBall.innerText = JSON.parse(localStorage.getItem('favorite')).length
)
// 即時更新收藏數量
function displayQuantity(amount) {
	favoriteBall.innerText = amount.length
}

// 搜索功能
searchForm.addEventListener("click", function onSearchFormSubmitted(event) {
	onSearch()
})
function onSearch() {
	// 新增判斷式來判斷下拉式表單出現什麼
	// 搜索
	let keyWord = searchInput.value.trim().toLowerCase();
	let serchTitle = document.querySelector('#seach-title').value
	// name 判斷
	if (serchTitle === 'name') {
		filteredPhoto = userBox.filter((user) =>
			user.name.toLowerCase().includes(keyWord)
		)
	}
	// surname 判斷
	if (serchTitle === 'surname') {
		filteredPhoto = userBox.filter((user) =>
			user.surname.toLowerCase().includes(keyWord)
		)
	}
	// age 判斷
	// 增加.toString() 把user.age 轉換成字串，即可正常執行
	if (serchTitle === 'age') {
		filteredPhoto = userBox.filter((user) => user.age.toString().toLowerCase().includes(keyWord)
		)
	}
	// Region 判斷
	if (serchTitle === 'region') {
		filteredPhoto = userBox.filter((user) =>
			user.region.toLowerCase().includes(keyWord)
		)
	}
	renderPage(filteredPhoto.length);
	renderUserList(getPhotoByPage(1));
	if (filteredPhoto.length === 0) {
		// 當搜索不到時，分頁會停留在搜索之前的模樣，因此當搜索不到時要再重新輸出一次分頁
		renderPage(userBox.length);
		renderUserList(getPhotoByPage(1));
		return alert(`您輸入的關鍵字：${keyWord} 沒有符合條件的人`);
	}
}
//  用Enter 也可以新增
searchInput.addEventListener("keydown", function () {
	let keyCode = event.keyCode;
	if (keyCode === 13) {
		// 避免不能輸入，必須當if成立時才會執行
		event.preventDefault();
		const inputValue = searchInput.value.trim();
		if (inputValue.length > 0) {
			onSearch(inputValue)
		}
	}
});

// <!-- 主畫面 -->
// 渲染照片牆
function renderUserList(data) {
	let photoHTML = "";
	let favoriteListID = [] //最愛使用者的id號碼
	for (let item of userClickStatus) {
		favoriteListID.push(item.id)
	}
	data.forEach((item) => {
		//     image, name
		if (favoriteListID.includes(item.id)) {
			item.favorite = `fa-solid`
		}  //有比對到id 加入實心樣式
		else { item.favorite = `fa-regular` } //沒有比對到id 加入一般樣式
		if (item.gender === "male") {
			let name = item.name + " " + item.surname
			photoHTML += `
      <div class="row">
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="photo-avatar">
              <div type="button" class="figure" data-bs-toggle="modal" data-bs-target="#photo-modal">
              <img src="${item.avatar}" id="${item.id}" class="figure-img img-fluid-male" alt="user-photo" >
              </div>
            <div class="caption-name">${name}</div>
            <div class="caption-age" style="color: Dodgerblue;"><i class="fa-solid fa-mars mt-2">\n${item.age}</i>
            </div>
            <div class="caption-region mt-2">${item.region}</div>
            <div class="add-favorite" style="color: red;"><i data-id="${item.id}" class="fa-regular fa-heart fa-2xl ${item.favorite}"></i></div>
            </div>
          </div>
        </div>
      </div>
    `;
		} else {
			let name = item.name + " " + item.surname
			photoHTML += `
      <div class="row">
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="photo-avatar">
              <div type="button" class="figure" data-bs-toggle="modal" data-bs-target="#photo-modal">
              <img src="${item.avatar}" id="${item.id}" class="figure-img img-fluid-female" alt="user-photo" >
              </div>
            <div class="caption-name">${name}</div>
            <div class="caption-age" style="color: hotpink;"><i class="fa-solid mt-2 fa-venus">\n${item.age}</i>
            </div>
            <div class="caption-region mt-2">${item.region}</div>
            <div class="add-favorite" style="color: red;" ><i data-id="${item.id}" class="fa-regular fa-heart fa-2xl ${item.favorite}"></i></div>
            </div>
          </div>
        </div>
      </div>
    `;
		}
		photoUser.innerHTML = photoHTML;
	});
}

// 點擊圖片出現互動視窗
photoUser.addEventListener("click", function onPanelClicked(event) {
	if (event.target.matches(".figure-img")) {
		showUserInfo(Number(event.target.id));
	} else if (event.target.matches(".fa-heart")) {
		// 設立收藏的監聽器
		addToFavorite(Number(event.target.dataset.id));
		addToHeart(event.target)
	}
});
// 卡關。點擊愛心收藏會變滿色

function addToHeart(e) {
	const userID = Number(e.dataset.id)
	const userIndex = userBox.findIndex((user) => user.id === userID)
	if (!e.matches(".fa-solid")) {
		e.classList.add("fa-solid")
		userBox[userIndex].favorite = "fa-solid"
		userClickStatus.push(userBox[userIndex])
	} else {
		e.classList.remove("fa-solid")
		userClickStatus.splice(userClickStatus[userIndex], 1)
	}
	localStorage.setItem("userClickStatus", JSON.stringify(userClickStatus))
}


// 加入收藏
function addToFavorite(id) {
	let list = JSON.parse(localStorage.getItem('favorite')) || []
	const user = userBox.find((user) => user.id === id)
	const userIndex = userBox.findIndex((user) => user.id === id)
	if (!list.some((user) => user.id === id)) {
		list.push(user)
	} else {
		list.splice(list[userIndex], 1)
	}
	localStorage.setItem('favorite', JSON.stringify(list))
	let amount = JSON.parse(localStorage.getItem('favorite'))
	displayQuantity(amount)
}

// <!-- Modal -->
function showUserInfo(id) {
	const modalTitle = document.querySelector(".modal-title");
	const modalPhoto = document.querySelector("#modal-image");
	const modalAge = document.querySelector(".age");
	const modalBirthday = document.querySelector(".birthday");
	const modalEmail = document.querySelector(".email");
	const modalGender = document.querySelector(".gender");
	const modalRegion = document.querySelector(".region");

	axios.get(INDEX_URL + id).then((responses) => {
		const data = responses.data;
		modalTitle.innerText = data.name + data.surname;
		modalPhoto.innerHTML = `<img src="${data.avatar}"  class="figure-img img-fluid rounded" alt="user-photo">`;
		modalAge.innerText = "Age : " + data.age;
		modalBirthday.innerText = "Birthday : " + data.birthday;
		modalEmail.innerText = "Email : " + data.email;
		modalGender.innerText = "Gender : " + data.gender;
		modalRegion.innerText = "Region : " + data.region;
	});
}

// 分頁功能
function getPhotoByPage(page) {
	const data = filteredPhoto.length ? filteredPhoto : userBox;
	const startIndex = (page - 1) * PHOTO_PER_PAGE;
	return data.slice(startIndex, startIndex + PHOTO_PER_PAGE);
}

function renderPage(amout) {
	const numberOfPages = Math.ceil(amout / PHOTO_PER_PAGE);
	let rawHTML = "";
	for (let page = 1; page <= numberOfPages; page++) {
		rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
		paginator.innerHTML = rawHTML;
	}
}

paginator.addEventListener("click", function onPanelClicked(event) {
	const page = event.target.dataset.page;
	if (event.target.tagName !== "A") return;
	renderUserList(getPhotoByPage(page));
});


// 從ＡＰＩ串接資料後加到userBox
axios.get(INDEX_URL).then((response) => {
	userBox.push(...response.data.results);

	renderPage(userBox.length);
	renderUserList(getPhotoByPage(1));
});
