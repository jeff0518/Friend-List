// 宣告區
const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";
const photoUser = document.querySelector(".photo-user");
const pageOfFavorite = document.querySelector('#paginator')
const PHOTO_PER_PAGE = 12;
// 資料從localStorage取出
const userBox = JSON.parse(localStorage.getItem('favorite'));
const userClickStatus = JSON.parse(localStorage.getItem("userClickStatus"))
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
let filteredPhoto = [];


// Myfavorites旁顯示好友數量
let favoriteBall = document.querySelector('.favorite-ball')
if (!JSON.parse(localStorage.getItem('favorite'))) {
	favoriteBall.innerText = 0
} else (
	favoriteBall.innerText = userBox.length
)

// 點擊圖片出現互動視窗
photoUser.addEventListener("click", function onPanelClicked(event) {
	if (event.target.matches(".figure-img")) {
		showUserInfo(Number(event.target.id));
	} else if (event.target.matches(".btn-remove-favorite")) {
		// 設立收藏的監聽器
		removeToFavorite(Number(event.target.id));
	}
});

// 渲染照片牆
function renderUserList(data) {
	let photoHTML = "";
	data.forEach((item) => {
		//     image, name
		let name = item.name + " " + item.surname
		if (item.gender === "male") {
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
            <button class="btn btn-danger btn-remove-favorite" id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `;
		} else if (item.gender === "female") {
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
            <button class="btn btn-danger btn-remove-favorite" id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `;
		}
	});
	photoUser.innerHTML = photoHTML;
}

// 刪除收藏
function removeToFavorite(id) {
	if (!userBox || !userBox.length) return
	const userIndex = userBox.findIndex((user) => user.id === id)
	console.log(userIndex)
	userBox.splice(userIndex, 1)
	console.log(userBox)
	userClickStatus.splice(userIndex, 1)
	console.log(userClickStatus)
	if (userIndex === -1) return
	localStorage.setItem('favorite', JSON.stringify(userBox))
	console.log(userBox)
	localStorage.setItem('userClickStatus', JSON.stringify(userClickStatus))
	console.log(userClickStatus)
	renderPaginator(userBox.length)
	renderUserList(getPhotoByPage(1))
	displayQuantity(userBox)
}

// 即時更新收藏數量
function displayQuantity(amount) {
	favoriteBall.innerText = amount.length
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
	renderPaginator(filteredPhoto.length);
	renderUserList(getPhotoByPage(1));
	if (filteredPhoto.length === 0) {
		// 當搜索不到時，分頁會停留在搜索之前的模樣，因此當搜索不到時要再重新輸出一次分頁
		renderPaginator(userBox.length);
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

// 分頁功能
// 確認切割的範圍 0~11 12~23 ...
function getPhotoByPage(page) {
	const data = filteredPhoto.length ? filteredPhoto : userBox
	const startIndex = (page - 1) * PHOTO_PER_PAGE
	return data.slice(startIndex, startIndex + PHOTO_PER_PAGE)
}

// 切割的頁數
function renderPaginator(amount) {
	const number = Math.ceil(amount / PHOTO_PER_PAGE)
	let rawHTML = ""
	for (let page = 1; page <= number; page++) {
		rawHTML += `
  <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
  `
		pageOfFavorite.innerHTML = rawHTML
	}
}

pageOfFavorite.addEventListener('click', function onPaginatorClicked(event) {
	if (event.target.tagName !== "A") return
	const page = event.target.dataset.page
	renderUserList(getPhotoByPage(page))
})

// 把收藏的資料傳到印出跟分頁function
renderPaginator(userBox.length)
renderUserList(getPhotoByPage(1))