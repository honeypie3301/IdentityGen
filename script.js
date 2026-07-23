const maleNames = [
    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
    "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
    "Kenneth", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan",
    "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon",
    "Benjamin", "Samuel", "Gregory", "Frank", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry",
    "Tyler", "Aaron", "Jose", "Adam", "Henry", "Nathan", "Douglas", "Zachary", "Peter", "Kyle", "Walter",
    "Ethan", "Jeremy", "Christian", "Keith", "Roger", "Terry", "Gerald", "Sean", "Arthur", "Lawrence",
    "Dylan", "Jesse", "Austin", "Bruce", "Joe", "Gabriel", "Logan", "Albert", "Willie", "Alan", "Juan",
    "Wayne", "Elijah", "Randy", "Roy", "Vincent", "Ralph", "Eugene", "Russell", "Bobby", "Mason", "Philip"
  ];
  
  const femaleNames = [
    "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
    "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
    "Dorothy", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura",
    "Cynthia", "Kathleen", "Amy", "Shirley", "Angela", "Helen", "Anna", "Brenda", "Pamela", "Nicole",
    "Emma", "Samantha", "Katherine", "Christine", "Debra", "Rachel", "Catherine", "Carolyn", "Janet",
    "Ruth", "Maria", "Heather", "Diane", "Virginia", "Julie", "Joyce", "Victoria", "Olivia", "Kelly",
    "Christina", "Lauren", "Joan", "Evelyn", "Judith", "Megan", "Cheryl", "Andrea", "Hannah", "Martha",
    "Jacqueline", "Lucille", "Frances", "Gloria", "Ann", "Teresa", "Kathryn", "Sara", "Janice", "Jean",
    "Alice", "Madison", "Doris", "Abigail", "Julia", "Judy", "Grace", "Denise", "Amber", "Marilyn", "Beverly"
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson",
    "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis",
    "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
    "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter",
    "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins",
    "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan",
    "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price"
  ];
  
  let historyList = [];
  let currentIdentity = null;
  let options = {
      gender: 'random',
      useNumbers: true,
      multipleFormats: true
  };
  
  const copyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  
  function generatePassword() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
  }
  
  function generateIdentity() {
      let firstNamesList = maleNames;
      let selectedGender = 'male';
  
      if (options.gender === 'female') {
          firstNamesList = femaleNames;
          selectedGender = 'female';
      } else if (options.gender === 'random') {
          if (Math.random() > 0.5) {
              firstNamesList = femaleNames;
              selectedGender = 'female';
          }
      }
  
      const first = firstNamesList[Math.floor(Math.random() * firstNamesList.length)] || "John";
      const last = lastNames[Math.floor(Math.random() * lastNames.length)] || "Doe";
      
      const fLow = first.toLowerCase().replace(/[^a-z]/g, '');
      const lLow = last.toLowerCase().replace(/[^a-z]/g, '');
      
      const formats = [];
      
      if (options.multipleFormats) {
          formats.push(`${fLow}.${lLow}@gmail.com`);
          formats.push(`${fLow}${lLow}@gmail.com`);
          formats.push(`${lLow}.${fLow}@gmail.com`);
      } else {
          formats.push(`${fLow}${lLow}@gmail.com`);
      }
  
      if (options.useNumbers) {
          const r1 = Math.floor(Math.random() * 8999999) + 1000000;
          const r2 = Math.floor(Math.random() * 89999) + 10000;
          formats.push(`${fLow}${r1}@gmail.com`);
          if (options.multipleFormats) {
              formats.push(`${fLow}.${lLow}${r2}@gmail.com`);
          }
      }
      
      const email = formats[Math.floor(Math.random() * formats.length)];
      
      const password = generatePassword();
      const id = Math.random().toString(36).substring(2, 9);
      const newIdentity = { id, firstName: first, lastName: last, email, gender: selectedGender, password };
      
      currentIdentity = newIdentity;
      historyList.unshift(newIdentity);
      if (historyList.length > 20) historyList.pop();
      
      render();
  }
  
  async function copyToClipboard(text, btnElement, defaultContent) {
      try {
          await navigator.clipboard.writeText(text);
          btnElement.innerHTML = checkIcon + (btnElement.innerText.trim() ? " Copied" : "");
          btnElement.classList.add('copied');
          setTimeout(() => {
              btnElement.innerHTML = defaultContent;
              btnElement.classList.remove('copied');
          }, 2000);
      } catch (err) {
          console.error('Failed to copy', err);
      }
  }
  
  function render() {
      // Render History
      const historyContainer = document.getElementById('history-list');
      historyContainer.innerHTML = '';
      historyList.forEach(item => {
          const div = document.createElement('div');
          div.className = `history-item ${currentIdentity && currentIdentity.id === item.id ? 'active' : ''}`;
          div.innerHTML = `
              <h3>${item.firstName} ${item.lastName}</h3>
              <p>${item.email}</p>
          `;
          div.onclick = () => {
              currentIdentity = item;
              render();
          };
          historyContainer.appendChild(div);
      });
  
      // Render Display
      const displayCol = document.getElementById('display-column');
      if (!currentIdentity) {
          displayCol.innerHTML = `<div class="empty-state">No identity generated yet.</div>`;
          return;
      }
  
      const { firstName, lastName, email, gender, password } = currentIdentity;
      const formattedGender = gender.charAt(0).toUpperCase() + gender.slice(1);
      
      displayCol.innerHTML = `
          <div class="identity-display">
              <div class="display-header">
                  <div class="display-title">
                      <h2>${firstName} ${lastName}</h2>
                      <p>${email}</p>
                  </div>
                  <button class="copy-btn" id="copy-all-btn">
                      ${copyIcon} Copy All
                  </button>
              </div>
              <div class="fields-grid">
                  ${createFieldRow('First Name', firstName)}
                  ${createFieldRow('Last Name', lastName)}
                  ${createFieldRow('Email Address', email)}
                  ${createFieldRow('Password', password)}
                  ${createFieldRow('Gender', formattedGender)}
              </div>
          </div>
      `;
  
      // Attach Copy Handlers
      document.getElementById('copy-all-btn').onclick = function() {
          const text = `First Name: ${firstName}\nLast Name: ${lastName}\nEmail: ${email}\nPassword: ${password}\nGender: ${formattedGender}`;
          copyToClipboard(text, this, `${copyIcon} Copy All`);
      };
  
      document.querySelectorAll('.field-copy').forEach(btn => {
          btn.onclick = function() {
              const val = this.getAttribute('data-value');
              copyToClipboard(val, this, copyIcon);
          };
      });
  }
  
  function createFieldRow(label, value) {
      return `
          <div class="field-row">
              <div class="field-info">
                  <span class="field-label">${label}</span>
                  <span class="field-value">${value}</span>
              </div>
              <button class="field-copy" data-value="${value}" title="Copy ${label}">
                  ${copyIcon}
              </button>
          </div>
      `;
  }
  
  // Event Listeners
  document.getElementById('generate-btn').addEventListener('click', generateIdentity);
  
  document.querySelectorAll('#gender-select button').forEach(btn => {
      btn.addEventListener('click', (e) => {
          document.querySelectorAll('#gender-select button').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          options.gender = e.target.getAttribute('data-value');
      });
  });
  
  document.getElementById('use-numbers').addEventListener('change', (e) => {
      options.useNumbers = e.target.checked;
  });
  
  document.getElementById('multiple-formats').addEventListener('change', (e) => {
      options.multipleFormats = e.target.checked;
  });
  
  // Initial generation
  generateIdentity();
