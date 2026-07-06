(function () {
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const navLinks = Array.from(document.querySelectorAll(".mobile-bottom-nav a"));
  const sectionIds = navLinks
    .map((link) => {
      const hash = link.getAttribute("href");
      return hash && hash.startsWith("#") ? hash.slice(1) : null;
    })
    .filter(Boolean);

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveNav() {
    if (!sections.length) return;

    let activeId = sections[0].id;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 180) {
        activeId = section.id;
      }
    }

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + activeId);
    });
  }

  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;

      const text = target.innerText.trim();
      try {
        await navigator.clipboard.writeText(text);
        button.classList.add("is-copied");
        window.setTimeout(() => button.classList.remove("is-copied"), 1300);
      } catch (error) {
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  });

  document.querySelectorAll("[data-prompt-builder]").forEach((builder) => {
    const output = builder.querySelector("#prompt-builder-output");
    const values = {
      role: "你是一位適合初學者的 AI 課程講師",
      task: "請幫我把下面的內容整理成容易理解的重點",
      context: "這是我要給初學者看的內容，請避免使用太難的專有名詞",
      format: "請用條列式回答，並在最後補一段提醒",
    };

    builder.querySelectorAll("[data-builder-choice].is-selected").forEach((button) => {
      values[button.dataset.builderChoice] = button.dataset.value;
    });

    function renderPrompt() {
      if (!output) return;
      output.textContent = `${values.role}。\n${values.task}。\n背景：${values.context}。\n${values.format}。\n\n以下是我的內容：\n（請貼上你的文字）`;
    }

    builder.querySelectorAll("[data-builder-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = button.dataset.builderChoice;
        values[group] = button.dataset.value;

        builder
          .querySelectorAll(`[data-builder-choice="${group}"]`)
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));

        renderPrompt();
      });
    });

    renderPrompt();
  });

  document.querySelectorAll("[data-response-lab]").forEach((lab) => {
    const responseData = {
      chatgpt: {
        label: "ChatGPT 觀察",
        title: "會主動補很多整理建議",
        summary: "適合快速得到完整表格、統計與後續提醒，但仍要人工確認更改與取消是否處理正確。",
        text: "可能輸出：\n訂購人｜品項｜甜度｜冰塊｜數量｜備註\n林淑惠｜珍珠奶茶｜正常甜｜少冰｜1｜無\n王大明｜茉莉綠茶｜無糖｜去冰｜1｜由半糖改無糖\n\n額外提醒：\n- 建議另外統計總杯數\n- 建議把取消和更改獨立列出\n- 可能會補充後續收款與分送流程",
      },
      gemini: {
        label: "Gemini 觀察",
        title: "格式清楚，適合快速整理",
        summary: "通常能把 LINE 訊息整理成乾淨表格，適合先得到一份可讀版本，再用追問補上統計或特殊備註。",
        text: "可能輸出：\n訂購統計表\n1. 珍珠奶茶：林淑惠、邱雅琪\n2. 茉莉綠茶：王大明，無糖去冰\n3. 拿鐵咖啡：蔡志遠，正常甜正常冰\n\n整理特色：\n- 表格與清單通常乾淨\n- 回答比較精簡\n- 若要抓更改紀錄，要明確要求列出",
      },
      claude: {
        label: "Claude 觀察",
        title: "比較會停下來標記疑點",
        summary: "遇到更改、取消、品項不確定時，較容易提醒需要確認，適合處理複雜或有矛盾的資料。",
        text: "可能輸出：\n我先整理出三類資訊：\n1. 已確認訂單：林淑惠、邱雅琪、蔡志遠\n2. 更改紀錄：王大明改成無糖去冰；蔡志遠其中一杯改黑糖鮮奶茶\n3. 取消紀錄：劉淑婷媽媽的薑汁撞奶取消\n\n需確認：\n- 店家是否有薑汁撞奶與黑糖鮮奶茶\n- 更改後甜度冰塊是否沿用原設定",
      },
    };

    const label = lab.querySelector("[data-response-label]");
    const title = lab.querySelector("[data-response-title]");
    const summary = lab.querySelector("[data-response-summary]");
    const text = lab.querySelector("[data-response-text]");

    function renderResponse(key) {
      const item = responseData[key];
      if (!item) return;
      if (label) label.textContent = item.label;
      if (title) title.textContent = item.title;
      if (summary) summary.textContent = item.summary;
      if (text) text.textContent = item.text;
    }

    lab.querySelectorAll("[data-response-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-response-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderResponse(button.dataset.responseChoice);
      });
    });

    renderResponse("chatgpt");
  });

  document.querySelectorAll("[data-experiment-lab]").forEach((lab) => {
    const experimentData = {
      drink: {
        tag: "課堂題目 B1",
        title: "LINE 飲料訂單整理",
        desc: "原始訊息裡有加訂、改單、取消、品項不確定，人工整理很容易漏掉。",
        prompt:
          "請把這份 LINE 群組飲料訂購訊息整理成訂購統計表，欄位包含訂購人、品項、甜度、冰塊、數量、備註，並列出更改與取消紀錄。",
        chatgptTitle: "補很多後續建議",
        chatgptOutput:
          "可能輸出：\n- 訂購明細表\n- 品項與總杯數統計\n- 收款提醒\n- 分送流程建議\n\n適合：需要完整流程草稿。\n注意：要人工確認改單與取消是否算對。",
        geminiTitle: "表格乾淨好讀",
        geminiOutput:
          "可能輸出：\n- 訂購統計表\n- 特殊備註清單\n- 總杯數摘要\n\n適合：先得到乾淨表格。\n注意：若要抓漏，要明確要求列出改單、取消、待確認。",
        claudeTitle: "先抓更改與取消",
        claudeOutput:
          "可能輸出：\n- 已確認訂單\n- 更改紀錄\n- 取消紀錄\n- 品項或甜度需確認\n\n適合：複雜資料第二輪檢查。\n注意：可能會先問你想要哪種格式。",
        best: "課堂判讀：先用 Gemini 做乾淨表格，再用 Claude 抓漏。",
        conclusion:
          "如果目標是快速整理飲料單，Gemini 類型的表格感很好；但有改單、取消、品項不確定時，Claude 類型的「抓疑點」很有價值。ChatGPT 則適合補後續收款、分送、通知流程。",
      },
      volunteer: {
        tag: "課堂題目 A1",
        title: "志工報名名單整理",
        desc: "報名資料常混在訊息、備註和口語文字裡，重點是整理欄位，也要標出不能直接使用的資料。",
        prompt:
          "請把這份志工報名資料整理成表格，欄位包含姓名、電話、可參加時段、是否可搬重物、備註，並列出資料不完整或需要再次確認的名單。",
        chatgptTitle: "會補活動流程",
        chatgptOutput:
          "可能輸出：\n- 志工名單表\n- 分組建議\n- 行前提醒文字\n- 工作分配流程\n\n適合：想連同通知、分工一起產出。\n注意：有時會自行補不存在的分組規則。",
        geminiTitle: "名單表格整齊",
        geminiOutput:
          "可能輸出：\n- 姓名、電話、時段、備註表\n- 上午/下午人數統計\n- 缺電話清單\n\n適合：先把雜亂資料整理到可閱讀狀態。\n注意：特殊條件可能要另外要求。",
        claudeTitle: "比較會提醒矛盾",
        claudeOutput:
          "可能輸出：\n- 可用名單\n- 資料缺漏\n- 需要確認：電話少一碼、同一人報兩個時段、84 歲是否適合搬重物\n\n適合：檢查資料能不能真的拿去用。",
        best: "課堂判讀：名單類任務不能只看表格漂亮，要看有沒有標出缺漏。",
        conclusion:
          "名單整理的結論很清楚：AI 很會排表格，但老師或承辦人真正需要的是「哪些資料不能直接用」。因此第二輪追問要請 AI 特別列出缺漏、矛盾和需要確認的地方。",
      },
      document: {
        tag: "課堂題目 C1",
        title: "公文白話解釋",
        desc: "正式文件的難點不是排版，而是把對象、日期、責任、要做的事整理成一般人能理解的語言。",
        prompt:
          "請用白話文解釋這份公文，整理出發文單位、對象、主要目的、重要日期、需要完成的事項，最後寫一段給一般民眾看的提醒。",
        chatgptTitle: "白話改寫自然",
        chatgptOutput:
          "可能輸出：\n- 這份公文在說什麼\n- 你需要做的 3 件事\n- 對民眾友善的提醒文字\n\n適合：把正式文字改成公告或通知。\n注意：法律或補助條件不能只信改寫結果。",
        geminiTitle: "摘要很快很清楚",
        geminiOutput:
          "可能輸出：\n- 發文單位\n- 適用對象\n- 截止日期\n- 必辦事項\n\n適合：快速抓重點。\n注意：語氣可能比較像條列摘要，少一點人味。",
        claudeTitle: "會提醒使用情境",
        claudeOutput:
          "可能輸出：\n- 白話摘要\n- 重要名詞解釋\n- 需要查證條文\n- 建議先確認用途：給民眾、同事或主管看的版本不同\n\n適合：有風險或正式用途的文字。",
        best: "課堂判讀：公文類要先摘要，再依對象改寫。",
        conclusion:
          "公文練習得到的重點是：AI 可以幫忙翻成白話，但不能代替承辦人確認法規、日期和資格。若要發出去，最好再追問「哪些地方需要人工查證」。",
      },
    };

    const fields = {
      tag: lab.querySelector("[data-experiment-tag]"),
      title: lab.querySelector("[data-experiment-title]"),
      desc: lab.querySelector("[data-experiment-desc]"),
      prompt: lab.querySelector("[data-experiment-prompt]"),
      chatgptTitle: lab.querySelector("[data-chatgpt-title]"),
      chatgptOutput: lab.querySelector("[data-chatgpt-output]"),
      geminiTitle: lab.querySelector("[data-gemini-title]"),
      geminiOutput: lab.querySelector("[data-gemini-output]"),
      claudeTitle: lab.querySelector("[data-claude-title]"),
      claudeOutput: lab.querySelector("[data-claude-output]"),
      best: lab.querySelector("[data-experiment-best]"),
      conclusion: lab.querySelector("[data-experiment-conclusion]"),
    };

    function renderExperiment(key) {
      const item = experimentData[key];
      if (!item) return;
      Object.entries(fields).forEach(([field, element]) => {
        if (element) element.textContent = item[field];
      });
    }

    lab.querySelectorAll("[data-experiment-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-experiment-scenario]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderExperiment(button.dataset.experimentScenario);
      });
    });

    renderExperiment("drink");
  });

  document.querySelectorAll("[data-compare-board]").forEach((board) => {
    const boardData = {
      volunteer: {
        title: "志工報名名單整理",
        desc: "把格式不一的姓名、電話、時段與備註整理成可檢查表格。",
        prompt: "請整理成表格，欄位包含姓名、電話、可參加時段、備註，並列出資料不完整或需要確認的名單。",
      },
      drink: {
        title: "LINE 飲料訂單統計",
        desc: "把多人留言、加訂、改單、取消整理成最後訂購表。",
        prompt: "請整理成訂購統計表，欄位包含訂購人、品項、甜度、冰塊、數量、備註，並列出更改與取消紀錄。",
      },
      document: {
        title: "公文白話解釋",
        desc: "把正式文件轉成一般人能理解的重點摘要。",
        prompt: "請用白話文解釋這份公文，整理出發文單位、對象、目的、重要日期、需要完成的事項。",
      },
      meeting: {
        title: "會議記錄整理",
        desc: "把凌亂討論整理成正式會議紀錄與行動追蹤。",
        prompt: "請整理成會議記錄，包含討論摘要、各方意見、決議事項、待辦事項、負責人與期限。",
      },
    };
    const votes = {};
    const title = board.querySelector("[data-board-title]");
    const desc = board.querySelector("[data-board-desc]");
    const prompt = board.querySelector("[data-board-prompt]");
    const summaryTitle = board.querySelector("[data-board-summary-title]");
    const summary = board.querySelector("[data-board-summary]");

    function renderScenario(key) {
      const item = boardData[key];
      if (!item) return;
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.desc;
      if (prompt) prompt.textContent = item.prompt;
    }

    function updateSummary() {
      const entries = Object.values(votes);
      if (!summaryTitle || !summary) return;
      if (!entries.length) {
        summaryTitle.textContent = "先選一個情境，再開始觀察";
        summary.textContent = "真正上課時，可以把同一題貼到三家 AI，再回到這裡記錄你看到的差異。";
        return;
      }
      const counts = entries.reduce((acc, model) => {
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {});
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      summaryTitle.textContent = `目前你最常選：${top[0]}`;
      summary.textContent = "這不是要選唯一冠軍，而是練習把「哪裡好用」說清楚。不同任務可能會得到不同答案。";
    }

    board.querySelectorAll("[data-board-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        board
          .querySelectorAll("[data-board-scenario]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderScenario(button.dataset.boardScenario);
      });
    });

    board.querySelectorAll("[data-board-vote]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.boardVote;
        votes[key] = button.dataset.model;
        board
          .querySelectorAll(`[data-board-vote="${key}"]`)
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        const result = board.querySelector(`[data-vote-result="${key}"]`);
        if (result) result.textContent = `你選擇：${button.dataset.model}`;
        updateSummary();
      });
    });

    renderScenario("volunteer");
    updateSummary();
  });

  document.querySelectorAll("[data-practice-lab]").forEach((lab) => {
    const practiceData = {
      a: {
        code: "A",
        title: "名單類：把雜亂資料變成可用表格",
        desc: "志工報名、家長聯絡、社區團員出席紀錄。適合練習欄位統一、電話格式、缺漏標記。",
        questions: [
          ["A1 志工名單整理", "整理姓名、電話、時段與備註。"],
          ["A2 家長聯絡名單", "依班級、座號與聯絡方式分類。"],
          ["A3 出席紀錄分析", "統計 5 個月出席次數與全勤狀況。"],
        ],
        prompt: "請把這份志工報名名單整理成表格，欄位包含：姓名、電話、可參加時段、備註。請另外列出資料不完整或需要確認的地方。",
        result: "一張可複查的名單表、時段統計、資訊不完整清單。",
      },
      b: {
        code: "B",
        title: "訂購採購：從 LINE 訊息抓出統計",
        desc: "飲料團購、文具採購、禮盒訂購。適合練習數量、規格、總計與特殊備註。",
        questions: [
          ["B1 飲料訂單整理", "處理加訂、改單、取消與甜度冰塊。"],
          ["B2 文具採購分類", "依品項、規格、數量與班級統計。"],
          ["B3 禮盒訂購統計", "整理口味、盒數、收件人與備註。"],
        ],
        prompt: "請把這份 LINE 訂購訊息整理成統計表，欄位包含：訂購人、品項、規格、甜度、冰塊、數量、備註。請列出需要再次確認的訂單。",
        result: "最後訂購表、總杯數或總金額、改單/取消/缺貨確認清單。",
      },
      c: {
        code: "C",
        title: "公文資料：把正式文字翻成白話",
        desc: "補助公文、公司通知。適合練習摘要、截止日期、誰要做什麼。",
        questions: [
          ["C1 補助公文白話", "整理對象、期限、資格與應備文件。"],
          ["C2 公司通知摘要", "把正式通知改寫成員工看得懂的版本。"],
          ["C3 活動簡章重點", "抓出日期、地點、費用與報名方式。"],
        ],
        prompt: "請用白話文解釋這份文件，整理出：誰發文、對象是誰、主要目的、重要日期、需要完成的事項。",
        result: "3 分鐘摘要、待辦事項、截止日期排序、給非專業者看的白話說明。",
      },
      d: {
        code: "D",
        title: "醫療健康：整理，但不替代專業判斷",
        desc: "用藥清單、健檢數值。適合練習表格化與提醒，但必須標註需由醫師確認。",
        questions: [
          ["D1 用藥時間表", "依早中晚睡前整理藥品與注意事項。"],
          ["D2 健檢數值分類", "標出偏高偏低，但不做診斷。"],
          ["D3 回診問題清單", "把家屬疑問整理成可詢問醫師的清單。"],
        ],
        prompt: "請把這份健康資料整理成表格，標出超出範圍或需要注意的項目。請不要下診斷，所有建議都標註需與醫師確認。",
        result: "每日服藥表、異常數值標記、家屬提醒清單，以及需醫師確認的事項。",
      },
      e: {
        code: "E",
        title: "教育學校：整理資料，也調整語氣",
        desc: "成績評語、班親會紀錄。適合練習正式格式、正向改寫與家長通知。",
        questions: [
          ["E1 成績與評語", "把觀察改寫成溫和但具體的評語。"],
          ["E2 班親會紀錄", "整理討論重點、決議與待辦事項。"],
          ["E3 家長通知草稿", "把提醒文字改成清楚不責備的語氣。"],
        ],
        prompt: "請先把資料整理成表格，再把評語改寫得更溫暖委婉，但保留真實觀察。請列出哪些地方需要老師再確認。",
        result: "成績表、委婉評語版本、家長通知草稿、會議待辦表。",
      },
      f: {
        code: "F",
        title: "商業業務：分類、分析、產出摘要",
        desc: "客訴、業績、出勤。適合練習分類統計、異常標記與主管摘要。",
        questions: [
          ["F1 客訴歸納", "分類問題、情緒強度與優先處理順序。"],
          ["F2 業績資料分析", "找出成長、下滑與需要追問的店點。"],
          ["F3 出勤記錄整理", "統計遲到、請假與異常紀錄。"],
        ],
        prompt: "請把這份業務資料分類整理，找出最常見的問題、最需要注意的異常，最後提供 200 字以內的主管摘要。",
        result: "分類統計、常見問題排行、改善建議、主管可快速閱讀的摘要。",
      },
      g: {
        code: "G",
        title: "會議演練：從會前到會後的完整流程",
        desc: "畢業旅行規劃會議。適合練習方案比較、會議紀錄、決議書與行動追蹤。",
        questions: [
          ["G1 會前方案比較", "比較地點、費用、交通與風險。"],
          ["G2 會中紀錄整理", "整理各方意見、分歧與共識。"],
          ["G3 會後行動追蹤", "列出負責人、期限與下一步。"],
        ],
        prompt: "請把以下會議內容整理成正式會議記錄，包含：討論摘要、各方意見、決議事項、待辦事項、負責人與期限。",
        result: "方案比較表、正式會議記錄、決議書草稿、會後行動追蹤表。",
      },
    };

    const code = lab.querySelector("[data-practice-code]");
    const title = lab.querySelector("[data-practice-title]");
    const desc = lab.querySelector("[data-practice-desc]");
    const prompt = lab.querySelector("[data-practice-prompt]");
    const result = lab.querySelector("[data-practice-result]");
    const questions = lab.querySelector("[data-practice-questions]");

    function renderPractice(key) {
      const item = practiceData[key];
      if (!item) return;
      if (code) code.textContent = item.code;
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.desc;
      if (questions) {
        questions.innerHTML = item.questions
          .map(([questionTitle, questionDesc]) => `<article><strong>${questionTitle}</strong><span>${questionDesc}</span></article>`)
          .join("");
      }
      if (prompt) prompt.textContent = item.prompt;
      if (result) result.textContent = item.result;
    }

    lab.querySelectorAll("[data-practice-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-practice-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderPractice(button.dataset.practiceChoice);
      });
    });

    renderPractice("a");
  });

  document.querySelectorAll("[data-role-lab]").forEach((lab) => {
    const roleData = {
      principal: {
        tag: "主持人 / 最終決策者",
        title: "校長室：在教育意義與預算之間取得平衡",
        desc: "立場中立，目標是在會議結束前形成共識，避免校外教學變成爭議事件。",
        prompt:
          "我是一所國小的校長，今天要主持六年級校外教學準備會議，有台南文化之旅與台中科工館兩個提案。請幫我整理兩方案優缺點、可能衝突點，以及一段正式但親切的開場白。",
        result: "兩方案比較清單、2 分鐘開場白、各單位可能反對意見與主持回應。",
      },
      student: {
        tag: "學生安全守門人",
        title: "學務處：先確認安全、人力與緊急應變",
        desc: "不一定反對台中，但會要求更完整的安全計畫，特別是長途車程、暈車、過敏與特殊需求學生。",
        prompt:
          "我是一所國小的學務主任，六年級要校外教學，學生共 90 人，包含暈車、花粉過敏與輕度肢體障礙學生。請幫我列出會議上必須確認的安全問題與應變清單。",
        result: "出發前、搭車途中、抵達目的地的安全檢核表，以及護理師、分組點名、緊急聯絡流程。",
      },
      budget: {
        tag: "預算把關人",
        title: "總務處：看見 27,000 元缺口與行政程序",
        desc: "台南在預算內，台中超出每生約 300 元。總務處要確認補貼來源、收據、保險、採購和報價程序。",
        prompt:
          "我是一所國小的總務主任，預算上限每人 1,500 元，共 90 人。台南每人約 1,200 元，台中每人約 1,800 元。請幫我準備一段清楚但不失禮的預算說明，並列出若採台中需要補齊的行政程序。",
        result: "預算比較、超支 27,000 元說明、家長會補貼流程、收支透明與書面文件提醒。",
      },
      teacher: {
        tag: "學生代言人",
        title: "班導師：把學生期待和特殊需求帶進會議",
        desc: "學生偏好台中，但班導師要同時看見路程、暈車、無障礙、過敏與行程不要太趕。",
        prompt:
          "我是六年級班導師代表，學生 62% 想去台中，但班上有暈車、花粉過敏與肢體障礙學生。請幫我準備一段會議發言，兼顧學生期待、教育意義與特殊需求照顧。",
        result: "代表學生發言稿、特殊需求照護重點、台南與台中對學生參與度的比較。",
      },
      parent: {
        tag: "家長聲音代表",
        title: "家長會：支持台中，但要求安全與費用透明",
        desc: "家長投票多數偏台中，也願意討論補貼差額；但希望學校講清楚安全、費用、志工與接送安排。",
        prompt:
          "我是國小家長會會長，家長 LINE 群投票 60% 支持台中、40% 支持台南。家長最在意安全、費用透明、孩子開心、行程豐富與教育意義。請幫我草擬 2 分鐘會議發言稿。",
        result: "家長問卷摘要、補貼每生 300 元的募款說明、安全與志工參與的提問清單。",
      },
    };

    const fields = {
      tag: lab.querySelector("[data-role-tag]"),
      title: lab.querySelector("[data-role-title]"),
      desc: lab.querySelector("[data-role-desc]"),
      prompt: lab.querySelector("[data-role-prompt]"),
      result: lab.querySelector("[data-role-result]"),
    };

    function renderRole(key) {
      const item = roleData[key];
      if (!item) return;
      Object.entries(fields).forEach(([field, element]) => {
        if (element) element.textContent = item[field];
      });
    }

    lab.querySelectorAll("[data-role-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-role-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderRole(button.dataset.roleChoice);
      });
    });

    renderRole("principal");
  });

  document.querySelectorAll("[data-notebook-lab]").forEach((lab) => {
    const notebookData = {
      sources: {
        tag: "Sources",
        title: "把議程、提案、問卷與錄音放進同一本筆記本",
        desc: "左側來源區是 NotebookLM 的核心。它不是到網路亂找答案，而是根據這些來源回答問題，還可以標示答案引用自哪份資料。",
        list: ["會議議程", "提案 A：台南府城歷史文化之旅", "提案 B：台中科學工藝博物館", "兩提案比較表與家長問卷", "現場會議錄音"],
        screenTitle: "來源已讀取",
        screenSubtitle: "先把會議資料放進同一本筆記本",
        caption: "操作模擬：先把會議資料放進 NotebookLM 的來源區。",
      },
      mindmap: {
        tag: "Mind Map",
        title: "一鍵把複雜會議變成結構圖",
        desc: "NotebookLM 依來源整理出會議概況、提案 A/B、各方考量與後續決議。這很適合快速理解一包複雜資料。",
        list: ["會議概況", "台南方案重點", "台中方案重點", "各方考量與調查", "最終決議與後續分工"],
        screenTitle: "生成心智圖",
        screenSubtitle: "把會議概況、提案與後續分工展開",
        caption: "操作模擬：NotebookLM 將同一包資料整理成會議心智圖。",
      },
      quiz: {
        tag: "Quiz",
        title: "用會議資料自動生成理解測驗",
        desc: "課堂示範中，NotebookLM 能根據會議資料問出「本次會議主要決議目的」或「台南方案對應哪個學科」這類題目。",
        list: ["確認是否理解會議目的", "檢查提案內容是否讀懂", "可做成課後複習", "快速看出資料盲點"],
        screenTitle: "生成測驗",
        screenSubtitle: "用會議資料檢查學員是否抓到重點",
        caption: "操作模擬：NotebookLM 根據來源內容產生課堂理解測驗。",
      },
      deck: {
        tag: "Deck / Video",
        title: "把決議轉成簡報、資訊圖表與影片摘要",
        desc: "同一包資料也能生成 PowerPoint、資訊圖表與影片摘要。結果漂亮，但文字和圖像仍要人工檢查，尤其中文字、排版與數字。",
        list: ["簡報可快速形成初稿", "影片摘要像簡報輪播加旁白", "資訊圖表適合溝通重點", "成品漂亮不等於可直接發布"],
        screenTitle: "生成簡報影片",
        screenSubtitle: "決議摘要變成簡報、圖表與旁白影片",
        caption: "操作模擬：同一包資料可以再加工成簡報與影片摘要，但仍需人工校對。",
      },
    };

    const tag = lab.querySelector("[data-notebook-tag]");
    const title = lab.querySelector("[data-notebook-title]");
    const desc = lab.querySelector("[data-notebook-desc]");
    const list = lab.querySelector("[data-notebook-list]");
    const screen = lab.querySelector("[data-notebook-screen]");
    const screenTitle = lab.querySelector("[data-notebook-screen-title]");
    const screenSubtitle = lab.querySelector("[data-notebook-screen-subtitle]");
    const caption = lab.querySelector("[data-notebook-caption]");

    function renderNotebook(key) {
      const item = notebookData[key];
      if (!item) return;
      if (tag) tag.textContent = item.tag;
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.desc;
      if (list) list.innerHTML = item.list.map((text) => `<li>${text}</li>`).join("");
      if (screen) screen.dataset.mode = key;
      if (screenTitle) screenTitle.textContent = item.screenTitle;
      if (screenSubtitle) screenSubtitle.textContent = item.screenSubtitle;
      if (caption) caption.textContent = item.caption;
    }

    lab.querySelectorAll("[data-notebook-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-notebook-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderNotebook(button.dataset.notebookChoice);
      });
    });

    renderNotebook("sources");
  });

  document.querySelectorAll("[data-c04-diagnostic-lab]").forEach((lab) => {
    const diagnosticData = {
      start: {
        tag: "Step 1",
        title: "先不要急著排班",
        user: "我負責六、七月排班，有五位同仁、端午休假、幾天一定要上班，正職與兼職時數不同。",
        ai: "可以先整理成提示詞，但目前還不適合直接排班，因為班別時間、休息規則與例外狀況仍不完整。",
        conclusion: "第一輪最好的問題不是「請幫我排」，而是「請問還缺什麼資訊？規則有沒有衝突？」",
        chips: ["語音口述", "規則整理", "先問缺漏"],
      },
      rest: {
        tag: "AI 問題 1",
        title: "6/21 強制上班會不會造成休息日問題？",
        user: "端午 6/18 到 6/20 休假，但 6/21 需要上班，另外還有 6/12、6/13、6/26、6/27 等指定服務日。",
        ai: "如果所有人都被安排連續工作，可能碰到六休一、補休或班距問題。需要知道哪些人上班、是否接力、每人前後班表。",
        conclusion: "補充後才知道不是「全員全天上班」，而是依班別接力。AI 的價值是先把這類風險攤開。",
        chips: ["六休一", "指定服務日", "接力班"],
      },
      parttime: {
        tag: "AI 問題 2",
        title: "兼職時數與平日人力是否足夠？",
        user: "正職每月約 168 小時，兼職約 84 小時，兼職時數可保留給會議或訓練，不一定全部排滿。",
        ai: "需要確認週日至週四由誰負責、週五週六是否優先排兼職，以及兼職未排滿時數是否算問題。",
        conclusion: "上課補充後得到規則：平日多由正職負責，週五週六服務班較適合兼職。這讓 AI 排班方向變清楚。",
        chips: ["正職 168 小時", "兼職 84 小時", "週末服務班"],
      },
      shift: {
        tag: "AI 問題 3",
        title: "班別時間與班距要先講清楚",
        user: "週五班從 17:00 到隔天 06:00，週六班從 14:00 到隔天 06:00，同一週盡量固定同班別。",
        ai: "需要檢查是否超過單日可承受工時、下一班是否間隔 11 小時以上，以及請假時替代者會不會連續過長。",
        conclusion: "這是第四堂最重要的工作觀念：AI 會排表，但人要提供限制條件，並確認輸出是否真的合規可用。",
        chips: ["週五夜班", "週六長班", "班距 11 小時"],
      },
    };

    const fields = {
      tag: lab.querySelector("[data-diagnostic-tag]"),
      title: lab.querySelector("[data-diagnostic-title]"),
      user: lab.querySelector("[data-diagnostic-user]"),
      ai: lab.querySelector("[data-diagnostic-ai]"),
      conclusion: lab.querySelector("[data-diagnostic-conclusion]"),
      chips: lab.querySelector("[data-diagnostic-chips]"),
    };

    function renderDiagnostic(key) {
      const item = diagnosticData[key];
      if (!item) return;
      Object.entries(fields).forEach(([field, element]) => {
        if (!element || field === "chips") return;
        element.textContent = item[field];
      });
      if (fields.chips) {
        fields.chips.innerHTML = item.chips.map((chip) => `<span>${chip}</span>`).join("");
      }
    }

    lab.querySelectorAll("[data-diagnostic-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-diagnostic-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderDiagnostic(button.dataset.diagnosticChoice);
      });
    });

    renderDiagnostic("start");
  });

  document.querySelectorAll("[data-shift-lab]").forEach((lab) => {
    const shiftData = {
      june23: {
        tag: "情境 1",
        title: "B 同仁 6/23（週二）請假",
        desc: "B 同仁在 6/23 原本就沒有被安排班別，因此不需要重排。這是一個很好的提醒：AI 應該先查表，再決定要不要動表。",
        status: "不用重排",
        mode: "查表完成",
        verdict: "不用重排，只需註記請假",
        activeDates: ["6/23 Tue"],
        logs: ["查 6/23 原班表", "確認 B 當天沒有班", "不啟動重排，只保留請假紀錄"],
        table: [
          ["日期", "6/23 週二"],
          ["原班表", "正職 A / C"],
          ["B 狀態", "固定排休"],
        ],
        checks: [
          ["原班表衝突", "無"],
          ["合規風險", "低"],
          ["下一步", "註記請假即可"],
        ],
      },
      june20: {
        tag: "情境 2",
        title: "如果 B 是 6/20（週六）請假",
        desc: "這時候就可能需要替代方案。課堂成果提醒：若直接讓 D 頂替，可能造成連續工時過長或班距不足，改由 C 支援較安全。",
        status: "需要調整",
        mode: "替代方案試算",
        verdict: "不能盲目換人，需避開班距風險",
        activeDates: ["6/20 Sat", "6/21 Sun"],
        logs: ["查 6/20 原班表：B 在週末服務班", "測試 D 頂替：可能造成過長連續工時", "改建議 C 支援，並再次檢查 11 小時間隔"],
        table: [
          ["日期", "6/20 週六"],
          ["風險", "週末長班"],
          ["建議", "C 支援優先"],
        ],
        checks: [
          ["直接 D 頂替", "不建議"],
          ["班距檢查", "需確認 11 小時"],
          ["下一步", "選最小異動方案"],
        ],
      },
      june26: {
        tag: "情境 3",
        title: "如果 B 是 6/26-27 請假",
        desc: "這個情境會牽動週五、週六服務班，也可能碰到 C 原本已請假。AI 不能只換一個名字，要同時檢查前後兩天與替代人選。",
        status: "需跨日檢查",
        mode: "跨日衝突掃描",
        verdict: "需要跨日重排，並列出調整理由",
        activeDates: ["6/26 Fri", "6/27 Sat"],
        logs: ["查 6/26-27 連續服務班", "排除 C：已有請假或不可用條件", "用 A / D 接力試算，輸出調整理由給承辦人確認"],
        table: [
          ["日期", "6/26-27"],
          ["限制", "C 已有請假"],
          ["建議", "A / D 接力"],
        ],
        checks: [
          ["跨日影響", "高"],
          ["替代人力", "需兩段檢查"],
          ["下一步", "輸出調整理由"],
        ],
      },
    };

    const fields = {
      tag: lab.querySelector("[data-shift-tag]"),
      title: lab.querySelector("[data-shift-title]"),
      desc: lab.querySelector("[data-shift-desc]"),
      status: lab.querySelector("[data-shift-status]"),
      mode: lab.querySelector("[data-shift-mode]"),
      verdict: lab.querySelector("[data-shift-verdict]"),
      calendar: lab.querySelector("[data-shift-calendar]"),
      logs: lab.querySelector("[data-shift-logs]"),
      table: lab.querySelector("[data-shift-table]"),
      checks: lab.querySelector("[data-shift-checks]"),
    };

    function renderShift(key) {
      const item = shiftData[key];
      if (!item) return;
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.title) fields.title.textContent = item.title;
      if (fields.desc) fields.desc.textContent = item.desc;
      if (fields.status) fields.status.textContent = item.status;
      if (fields.mode) fields.mode.textContent = item.mode;
      if (fields.verdict) fields.verdict.textContent = item.verdict;
      if (fields.calendar) {
        fields.calendar.querySelectorAll(".calendar-cell").forEach((cell) => {
          const date = cell.querySelector("span")?.textContent?.trim();
          cell.classList.toggle("is-active", item.activeDates.includes(date));
          cell.classList.toggle("is-warning", item.status !== "不用重排" && item.activeDates.includes(date));
        });
      }
      if (fields.logs) {
        fields.logs.innerHTML = item.logs
          .map((log, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><p>${log}</p></div>`)
          .join("");
      }
      if (fields.table) {
        fields.table.innerHTML = item.table
          .map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`)
          .join("");
      }
      if (fields.checks) {
        fields.checks.innerHTML = item.checks
          .map(([label, value]) => `<article><span></span><strong>${label}</strong><small>${value}</small></article>`)
          .join("");
      }
    }

    lab.querySelectorAll("[data-shift-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-shift-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderShift(button.dataset.shiftChoice);
      });
    });

    renderShift("june23");
  });

  document.querySelectorAll("[data-gem-studio]").forEach((studio) => {
    const gemData = {
      rules: {
        mode: "規則記憶中",
        tag: "設定重點",
        title: "把每次都要重講的排班規則存進 Gem",
        desc: "上課時建立的「排班小助手」不是替人決定班表，而是把公司規則固定下來，讓每次詢問請假或調班時，都能先用同一套邏輯檢查。",
        example: "如果 B 同仁 6/23 請假，請先確認他當天是否有班，再判斷是否需要重排。",
        memory: ["正職與兼職時數不同", "週五、週六服務班優先安排兼職", "班距至少 11 小時，避免連續過長"],
      },
      check: {
        mode: "檢查流程啟動",
        tag: "操作習慣",
        title: "不要一收到請假就重排，先跑三個檢查",
        desc: "Gem 的價值是把老師課堂示範的判斷順序固定下來：先查原班表，再檢查規則，最後才決定是否需要改動。",
        example: "請依序檢查：一、B 當天是否有班；二、替代人選是否違反班距；三、是否影響下一個服務日。",
        memory: ["先查當天原班表", "檢查替代者前後班距", "只做必要的最小調整"],
      },
      output: {
        mode: "輸出格式套用",
        tag: "成果格式",
        title: "讓 Gem 每次都說清楚為什麼這樣調",
        desc: "排班不是只要答案，還要能讓承辦人回頭檢查。輸出格式固定後，AI 會列出結論、調整理由、風險提醒與需要人工確認的地方。",
        example: "請輸出：是否需要重排、建議調整方案、違反或符合的規則、還需要人工確認的問題。",
        memory: ["先給結論", "列調整理由", "標出需人工確認項目"],
      },
    };

    const fields = {
      mode: studio.querySelector("[data-gem-mode]"),
      tag: studio.querySelector("[data-gem-tag]"),
      title: studio.querySelector("[data-gem-title]"),
      desc: studio.querySelector("[data-gem-desc]"),
      example: studio.querySelector("[data-gem-example]"),
      memory: studio.querySelector("[data-gem-memory]"),
    };

    function renderGem(key) {
      const item = gemData[key];
      if (!item) return;
      Object.entries(fields).forEach(([field, element]) => {
        if (!element || field === "memory") return;
        element.textContent = item[field];
      });
      if (fields.memory) {
        fields.memory.innerHTML = item.memory.map((text) => `<li>${text}</li>`).join("");
      }
    }

    studio.querySelectorAll("[data-gem-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        studio
          .querySelectorAll("[data-gem-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderGem(button.dataset.gemChoice);
      });
    });

    renderGem("rules");
  });

  document.querySelectorAll("[data-outcome-stage]").forEach((stage) => {
    const outcomeData = {
      document: {
        tag: "Word 文件",
        title: "2026 六、七月份班表初稿",
        desc: "AI 根據補充後的規則產出班表文件，再由人確認假日、班距、工時與特殊請假。",
        conclusion: "課堂結論：AI 可以很快產出草稿，但要由人做最後規則檢查。",
      },
      system: {
        tag: "互動工具",
        title: "智慧排班系統雛形",
        desc: "用 Canvas 概念做出可切換情境的排班檢查工具，示範 AI 不只寫文字，也能協助生成操作介面。",
        conclusion: "課堂結論：真正厲害的是把規則變成可檢查流程，而不是只輸出漂亮表格。",
      },
      gem: {
        tag: "Gem 小助手",
        title: "把規則保存成可重複使用流程",
        desc: "下次遇到請假或異動，不必從零說明，直接用同一套規則檢查是否需要調整。",
        conclusion: "課堂結論：Gem 適合保存穩定背景，讓 AI 從一次回答變成長期工作助手。",
      },
      bonus: {
        tag: "課堂加碼",
        title: "AI 修圖、Suno 歌曲與影音示範",
        desc: "課堂後段示範吉他手影像編輯、Canva/Photoshop 整合，以及「嘉義健康幸福城市」歌曲生成。",
        conclusion: "課堂結論：AI 可以同時進入工作流程與創作流程，但成品仍要看用途與授權。",
      },
    };

    const fields = {
      visual: stage.querySelector("[data-outcome-visual]"),
      tag: stage.querySelector("[data-outcome-tag]"),
      title: stage.querySelector("[data-outcome-title]"),
      desc: stage.querySelector("[data-outcome-desc]"),
      conclusion: stage.querySelector("[data-outcome-conclusion]"),
    };

    function renderOutcome(key) {
      const item = outcomeData[key];
      if (!item) return;
      if (fields.visual) fields.visual.dataset.mode = key;
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.title) fields.title.textContent = item.title;
      if (fields.desc) fields.desc.textContent = item.desc;
      if (fields.conclusion) fields.conclusion.textContent = item.conclusion;
    }

    stage.querySelectorAll("[data-outcome-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        stage
          .querySelectorAll("[data-outcome-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderOutcome(button.dataset.outcomeChoice);
      });
    });

    renderOutcome("document");
  });

  document.querySelectorAll("[data-song-lab]").forEach((lab) => {
    const songData = {
      themes: {
        birthday: {
          label: "生日祝福",
          title: "今天是你的生日",
          story: "把生日祝福寫成一首溫暖、容易跟唱的歌，適合傳給家人或朋友。",
          subject: "生日祝福",
          language: "Mandarin Chinese lyrics",
          lines: {
            verse1: ["清晨的光，替你點亮願望", "今天的笑，比蠟燭更閃亮"],
            chorus: ["祝你生日快樂，心裡有光", "每一步都有人為你鼓掌"],
            verse2: ["走過的路，都變成禮物", "未來的夢，慢慢開花"],
            bridge: "願你記得，你值得被珍藏",
          },
          result: "歌曲會偏溫暖、好入口，副歌容易變成祝福句。課堂提醒：如果歌詞太密，AI 可能唱得很趕，要拆短句。",
          a: ["副歌清楚、適合分享", "人聲自然，副歌容易記。適合保留後再微調歌詞密度。"],
          b: ["編曲較滿、情緒更強", "氣氛較華麗，但如果中文字咬字不清楚，就要簡化歌詞或重新生成。"],
        },
        family: {
          label: "幸福家庭",
          title: "幸福的我們家",
          story: "把家人、餐桌、日常陪伴整理成歌曲，重點是畫面感和情感真實。",
          subject: "幸福家庭與日常陪伴",
          language: "Mandarin Chinese lyrics",
          lines: {
            verse1: ["晚餐的香，從廚房慢慢亮", "一句吃飽沒，心就有地方"],
            chorus: ["幸福的我們家，不一定很偉大", "有人等門，就是最暖的回答"],
            verse2: ["吵鬧也好，沉默也不怕", "回頭一看，愛都在身旁"],
            bridge: "原來平凡，是最珍貴的收藏",
          },
          result: "家庭主題最適合做成暖歌，畫面越具體越感人，例如餐桌、電話、等門、一起出門。",
          a: ["家庭感強、畫面溫柔", "適合當成家庭影片、生日聚會或成果發表背景。"],
          b: ["副歌更像合唱版", "如果想給全家一起唱，可以保留重複句並調整為更口語。"],
        },
        silver: {
          label: "銀髮出發",
          title: "銀髮勇壯族",
          story: "把銀髮族重新出發、學習新科技、參加活動的精神做成振奮歌曲。",
          subject: "銀髮族重新出發與勇敢學習",
          language: "Mandarin Chinese lyrics",
          lines: {
            verse1: ["白髮也能迎著風，笑著向前走", "手機亮起來，世界在招手"],
            chorus: ["銀髮勇壯族，腳步不認輸", "今天學會一點，明天就更有路"],
            verse2: ["朋友牽朋友，歌聲一起走", "人生下半場，也能很閃耀"],
            bridge: "年紀不是句點，是新的開頭",
          },
          result: "銀髮主題適合振奮、正向、節奏明確的曲風。副歌可以做成活動口號，很適合成果展。",
          a: ["節奏明亮、像活動主題曲", "適合搭配班級照片、成果影片或長青活動開場。"],
          b: ["更像民謠合唱", "如果想要親切感，可以降低速度並加入吉他、二胡或口琴。"],
        },
        patience: {
          label: "生活小抱怨",
          title: "我的耐心已陣亡",
          story: "把家務、等待、忘東忘西這類小抱怨變成幽默洗腦歌，情緒要輕鬆，不要太沉重。",
          subject: "生活裡的幽默抱怨",
          language: "Mandarin Chinese lyrics",
          lines: {
            verse1: ["碗還在水槽裡排隊站崗", "我的耐心已經開始搖晃"],
            chorus: ["我的耐心已陣亡，請你快點幫個忙", "不是我要碎念，是碗筷太囂張"],
            verse2: ["垃圾袋又滿了，鞋子還亂放", "笑一笑沒關係，先把事情扛"],
            bridge: "愛不是不生氣，是願意一起收場",
          },
          result: "幽默歌要設定語氣，例如童聲、輕快、洗腦。否則 AI 可能唱成太嚴肅的抒情抱怨。",
          a: ["洗腦感強、容易記住", "適合課堂展示，讓大家立刻感受到生活故事可以變歌曲。"],
          b: ["語氣更誇張、比較戲劇化", "如果太吵或太幼稚，可以改成輕爵士或木吉他版本。"],
        },
        chiayi: {
          label: "嘉義夏天",
          title: "嘉義午後的風",
          story: "把嘉義的夏天、老街、雞肉飯、阿里山和午後風景整理成城市印象歌曲。",
          subject: "嘉義夏天與城市記憶",
          language: "Mandarin Chinese lyrics",
          lines: {
            verse1: ["午後的風，穿過嘉義街口", "雞肉飯香，留住慢慢走的時候"],
            chorus: ["嘉義的夏天，有樹影也有光", "每一條老路，都把故事收藏"],
            verse2: ["火車聲遠，阿里山在雲上", "鳳凰木開，紅得像願望"],
            bridge: "回憶不是遠方，是轉角的日常",
          },
          result: "城市主題需要具體地名和感官細節。越像真的走在嘉義街上，歌曲越有辨識度。",
          a: ["在地感明顯、適合城市短片", "二胡、吉他或台灣民謠元素會讓畫面更接近嘉義印象。"],
          b: ["更輕快、適合旅遊宣傳", "如果想做活動使用，要再確認授權與公開用途。"],
        },
      },
      styles: {
        warm: {
          label: "溫暖抒情",
          prompt: "Mandarin pop, warm and heartfelt, piano and acoustic guitar, gentle female vocal",
          aiMood: "溫暖真誠",
        },
        playful: {
          label: "童聲洗腦",
          prompt: "playful pop, catchy chorus, light percussion, childlike backing vocals",
          aiMood: "幽默、輕快、洗腦但不尖銳",
        },
        folk: {
          label: "台灣民謠",
          prompt: "Taiwanese folk, nostalgic, acoustic guitar and erhu, soft percussion",
          aiMood: "懷舊、親切、有台灣在地感",
        },
        uplift: {
          label: "振奮流行",
          prompt: "uplifting Mandarin pop, energetic drums, piano and strings, powerful chorus",
          aiMood: "振奮、鼓勵、有活動主題曲感",
        },
        jazz: {
          label: "輕爵士",
          prompt: "light jazz pop, relaxed, piano, upright bass and soft brush drums",
          aiMood: "輕鬆、幽默、像咖啡館裡的生活小品",
        },
      },
      structures: {
        simple: {
          label: "簡單版",
          tags: ["[Verse 1]", "[Chorus]", "[Verse 2]", "[Chorus]"],
          description: "包含主歌和副歌，適合第一次嘗試，結構不會太複雜。",
        },
        pop: {
          label: "流行歌版",
          tags: ["[Intro]", "[Verse 1]", "[Chorus]", "[Verse 2]", "[Chorus]", "[Bridge]", "[Chorus]", "[Outro]"],
          description: "有前奏、主歌、副歌、橋段和結尾，比較像完整流行歌。",
        },
        bridge: {
          label: "加橋段轉折",
          tags: ["[Intro]", "[Verse 1]", "[Pre-Chorus]", "[Chorus]", "[Verse 2]", "[Bridge]", "[Chorus]", "[Outro]"],
          description: "加入預副歌與橋段，適合需要情緒推進或故事轉折的題目。",
        },
      },
    };

    const values = { theme: "birthday", style: "warm", structure: "pop" };
    const fields = {
      label: lab.querySelector("[data-song-label]"),
      title: lab.querySelector("[data-song-title]"),
      story: lab.querySelector("[data-song-story]"),
      aiPrompt: lab.querySelector("[data-song-ai-prompt]"),
      style: lab.querySelector("[data-song-style]"),
      lyrics: lab.querySelector("[data-song-lyrics]"),
      result: lab.querySelector("[data-song-result]"),
    };
    const studio = document.querySelector("[data-suno-studio]");

    function buildLyrics(theme, structureKey) {
      const structure = songData.structures[structureKey];
      const lines = theme.lines;
      const parts = {
        "[Intro]": "[Intro]",
        "[Verse 1]": `[Verse 1]\n${lines.verse1.join("\n")}`,
        "[Pre-Chorus]": "[Pre-Chorus]\n情緒慢慢升高，準備進副歌",
        "[Chorus]": `[Chorus]\n${lines.chorus.join("\n")}`,
        "[Verse 2]": `[Verse 2]\n${lines.verse2.join("\n")}`,
        "[Bridge]": `[Bridge]\n${lines.bridge}`,
        "[Outro]": "[Outro]",
      };
      return structure.tags.map((tag) => parts[tag]).join("\n\n");
    }

    function syncStudio(payload) {
      if (!studio) return;
      const lyricField = studio.querySelector("[data-suno-lyrics]");
      const styleField = studio.querySelector("[data-suno-style]");
      const titleField = studio.querySelector("[data-suno-title]");
      const status = studio.querySelector("[data-suno-status]");
      const aTitle = studio.querySelector("[data-suno-a-title]");
      const aDesc = studio.querySelector("[data-suno-a-desc]");
      const bTitle = studio.querySelector("[data-suno-b-title]");
      const bDesc = studio.querySelector("[data-suno-b-desc]");

      if (lyricField) lyricField.value = payload.lyrics;
      if (styleField) styleField.value = payload.stylePrompt;
      if (titleField) titleField.value = payload.title;
      if (status) status.textContent = "已把提示詞放進模擬 Suno 欄位，按 Create 看兩版生成動畫。";
      if (aTitle) aTitle.textContent = payload.theme.a[0];
      if (aDesc) aDesc.textContent = payload.theme.a[1];
      if (bTitle) bTitle.textContent = payload.theme.b[0];
      if (bDesc) bDesc.textContent = payload.theme.b[1];
      studio.querySelectorAll(".suno-result-card").forEach((card) => card.classList.remove("is-generating"));
    }

    function renderSong() {
      const theme = songData.themes[values.theme];
      const style = songData.styles[values.style];
      const structure = songData.structures[values.structure];
      const lyrics = buildLyrics(theme, values.structure);
      const stylePrompt = `${style.prompt}, ${theme.language}`;

      if (fields.label) fields.label.textContent = theme.label;
      if (fields.title) fields.title.textContent = theme.title;
      if (fields.story) fields.story.textContent = theme.story;
      if (fields.aiPrompt) {
        fields.aiPrompt.textContent = `請幫我寫一首國語流行歌歌詞，主題是${theme.subject}，情緒是${style.aiMood}，請用「${structure.label}」安排段落，每行不要太長，適合放進 Suno。`;
      }
      if (fields.style) fields.style.textContent = stylePrompt;
      if (fields.lyrics) fields.lyrics.textContent = lyrics;
      if (fields.result) fields.result.textContent = `${theme.result} 目前結構：${structure.description}`;

      syncStudio({ theme, title: theme.title, lyrics, stylePrompt });
    }

    lab.querySelectorAll("[data-song-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = button.dataset.songChoice;
        values[group] = button.dataset.value;
        lab
          .querySelectorAll(`[data-song-choice="${group}"]`)
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderSong();
      });
    });

    renderSong();
  });

  document.querySelectorAll("[data-suno-studio]").forEach((studio) => {
    const button = studio.querySelector("[data-suno-generate]");
    const status = studio.querySelector("[data-suno-status]");
    if (!button) return;

    button.addEventListener("click", () => {
      studio.querySelectorAll(".suno-result-card").forEach((card) => {
        card.classList.remove("is-active");
        card.classList.add("is-generating");
      });
      if (status) status.textContent = "生成中：Suno 通常一次給兩個版本，課堂會一起比較哪一版更適合。";
      window.setTimeout(() => {
        studio.querySelectorAll(".suno-result-card").forEach((card, index) => {
          card.classList.remove("is-generating");
          card.classList.toggle("is-active", index === 0);
        });
        if (status) status.textContent = "完成：先聽副歌、咬字、情緒，再決定保留、重生或局部修改。";
      }, 900);
    });
  });

  document.querySelectorAll("[data-music-player]").forEach((player) => {
    const video = player.querySelector("[data-work-video]");
    const title = player.querySelector("[data-work-title]");
    const maker = player.querySelector("[data-work-maker]");
    const note = player.querySelector("[data-work-note]");

    player.querySelectorAll("[data-work-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        player
          .querySelectorAll("[data-work-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        if (video && button.dataset.src) {
          video.pause();
          video.src = button.dataset.src;
          video.load();
        }
        if (title) title.textContent = button.dataset.title || "";
        if (maker) maker.textContent = button.dataset.maker || "";
        if (note) note.textContent = button.dataset.note || "";
      });
    });
  });

  document.querySelectorAll("[data-copyright-lab]").forEach((lab) => {
    const copyrightData = {
      family: {
        tag: "較低風險",
        title: "傳給家人朋友聽",
        desc: "課堂提醒：免費版通常適合個人、非商業分享，但仍要遵守平台條款，不要拿去營利或宣稱完全擁有權利。",
        action: "建議做法：保留作品用途、生成平台與日期；正式公開前再確認最新條款。",
      },
      social: {
        tag: "需看用途",
        title: "FB / IG 非營利分享",
        desc: "如果只是分享學習成果，通常比商業使用單純；但平台條款、公開範圍、是否導流營利都可能影響判斷。",
        action: "建議做法：標註 AI 生成，避免使用特定歌手風格或侵權素材，公開前確認 Suno 最新條款。",
      },
      youtube: {
        tag: "高風險",
        title: "YouTube 分潤影片",
        desc: "只要牽涉廣告、分潤、業配或營利，就不能用「只是分享」來看。課堂提醒要特別確認方案授權與平台規則。",
        action: "建議做法：使用符合商業授權的方案，保存生成紀錄；仍需確認 YouTube 與 Suno 相關條款。",
      },
      event: {
        tag: "需正式確認",
        title: "商業活動配樂",
        desc: "活動、招生、廣告或收費內容都可能被視為商業使用。免費版作品通常不適合直接拿來做商業用途。",
        action: "建議做法：先向平台確認商業授權，重要用途請請教法律或授權專業人士。",
      },
      claim: {
        tag: "不要這樣做",
        title: "主張自己擁有完整著作權",
        desc: "課堂中特別提到：AI 生成作品的著作權在不同國家與情境下很複雜，台灣也仍有不確定性。",
        action: "建議做法：不要把 AI 全自動生成作品當成可完全主張的人類原創作品；正式用途需查證。",
      },
    };

    const fields = {
      tag: lab.querySelector("[data-copyright-tag]"),
      title: lab.querySelector("[data-copyright-title]"),
      desc: lab.querySelector("[data-copyright-desc]"),
      action: lab.querySelector("[data-copyright-action]"),
    };

    function renderCopyright(key) {
      const item = copyrightData[key];
      if (!item) return;
      Object.entries(fields).forEach(([field, element]) => {
        if (element) element.textContent = item[field];
      });
    }

    lab.querySelectorAll("[data-copyright-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-copyright-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderCopyright(button.dataset.copyrightChoice);
      });
    });

    renderCopyright("family");
  });

  document.querySelectorAll("[data-project-lab]").forEach((lab) => {
    const projectData = {
      schedule: {
        tag: "工作場景",
        title: "護理行政排班",
        pain: "每月要排很多人的班，規則複雜，臨時請假時還要重新檢查。",
        question: "你現在排班時最容易出錯的是「人力不足、休假衝突、班距限制」哪一種？",
        context: "單位人數、班別時間、休假規則、正兼職時數、哪些資訊需要去識別化。",
        result: "排班規則檢查表、請假情境判斷流程、下次可重複使用的排班小助手。",
        privacy: "先用 A/B/C 代替真實姓名，不上傳身分證、薪資或病歷資料。",
      },
      volunteer: {
        tag: "社區工作",
        title: "社區活動通知",
        pain: "每次活動都要寫公告、招募文、提醒訊息，內容差不多但又不能完全一樣。",
        question: "你最常重複寫的是活動前招募、活動中提醒，還是活動後感謝？",
        context: "活動類型、對象、地點、報名方式、常用語氣、以前用過的公告範例。",
        result: "活動通知模板、LINE 群組提醒文、志工招募文案與活動後感謝文。",
        privacy: "可提供去識別化範例，不要貼完整電話、地址或個人名單。",
      },
      budget: {
        tag: "生活整理",
        title: "家庭收支整理",
        pain: "收據、轉帳、現金支出分散在不同地方，月底整理很花時間。",
        question: "你現在最難整理的是收據分類、每月統計，還是預算提醒？",
        context: "支出分類、每月固定費用、想看的統計方式、是否會拍收據或手動輸入。",
        result: "家計分類表、每月支出摘要、預算提醒文字或簡易記帳模板。",
        privacy: "金額可以保留，但帳號、完整地址、信用卡資訊不要上傳。",
      },
      travel: {
        tag: "生活專案",
        title: "暑假旅遊規劃",
        pain: "想出國或安排家庭旅遊，但不知道從交通、景點、住宿哪裡開始。",
        question: "你最需要 AI 幫忙的是找目的地、排每日行程，還是整理出入境與交通資訊？",
        context: "旅遊天數、同行者、預算、體力限制、偏好景點、出發城市。",
        result: "五天四夜行程表、交通查詢清單、住宿比較表、每日備忘清單。",
        privacy: "行程可討論，但護照號碼、訂房付款資訊與完整個資不要提供。",
      },
      document: {
        tag: "文書流程",
        title: "固定格式文件",
        pain: "工作要把資料填進固定 Word 格式，複製貼上很慢，而且格式不能跑掉。",
        question: "你最想保留的是表格版型、字體格式，還是每個欄位的位置？",
        context: "Excel 欄位、Word 範本欄位、哪些欄位會重複、哪些資料不能外流。",
        result: "欄位對應表、合併列印流程、內容控制項範本或本機巨集工具。",
        privacy: "可描述欄位名稱和格式，不必上傳真實客戶或公司資料。",
      },
    };

    const fields = {
      tag: lab.querySelector("[data-project-tag]"),
      title: lab.querySelector("[data-project-title]"),
      pain: lab.querySelector("[data-project-pain]"),
      question: lab.querySelector("[data-project-question]"),
      context: lab.querySelector("[data-project-context]"),
      result: lab.querySelector("[data-project-result]"),
      privacy: lab.querySelector("[data-project-privacy]"),
    };

    function renderProject(key) {
      const item = projectData[key];
      if (!item) return;
      Object.entries(fields).forEach(([field, element]) => {
        if (element) element.textContent = item[field];
      });
    }

    lab.querySelectorAll("[data-project-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-project-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderProject(button.dataset.projectChoice);
      });
    });

    renderProject("schedule");
  });

  document.querySelectorAll("[data-dialog-lab]").forEach((lab) => {
    const dialogData = {
      branch: {
        mode: "branch",
        tag: "課堂示範",
        title: "用分支保留不同方向",
        desc: "同一段對話可以從某個回覆分出去，A 方案、B 方案各自往下問，避免覆蓋原本覺得好的答案。",
        conclusion: "適合：同一問題想比較不同方向，例如現代情感版、犀利旁白版、正式版。",
      },
      summary: {
        mode: "summary",
        tag: "Token 管理",
        title: "對話太長時，先請 AI 彙整精華",
        desc: "請 AI 整理目前已決定的內容、不要的方向、接下來要解決的問題，再把摘要帶到新對話接續。",
        conclusion: "適合：免費版快到上限、對話太長、AI 開始忘記前面重點時。",
      },
      goal: {
        mode: "goal",
        tag: "拉回主線",
        title: "重複提醒 AI 最終想要什麼",
        desc: "長對話很容易越問越偏。每隔幾輪就提醒：我的專案目標是什麼、最後想產出什麼形式。",
        conclusion: "適合：AI 開始給太多旁支建議，或一直延伸但沒有回到成果時。",
      },
    };

    const fields = {
      visual: lab.querySelector("[data-dialog-visual]"),
      tag: lab.querySelector("[data-dialog-tag]"),
      title: lab.querySelector("[data-dialog-title]"),
      desc: lab.querySelector("[data-dialog-desc]"),
      conclusion: lab.querySelector("[data-dialog-conclusion]"),
    };

    function renderDialog(key) {
      const item = dialogData[key];
      if (!item) return;
      if (fields.visual) fields.visual.dataset.mode = item.mode;
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.title) fields.title.textContent = item.title;
      if (fields.desc) fields.desc.textContent = item.desc;
      if (fields.conclusion) fields.conclusion.textContent = item.conclusion;
    }

    lab.querySelectorAll("[data-dialog-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-dialog-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderDialog(button.dataset.dialogChoice);
      });
    });

    renderDialog("branch");
  });

  document.querySelectorAll("[data-workflow-lab]").forEach((lab) => {
    const workflowData = {
      docx: {
        tag: "文書自動化",
        title: "保留 Word 版型，把 Excel 欄位自動填進去",
        before: "把 Excel 和 Word 都丟給 AI，請它直接產生一份不跑版的新 DOCX。",
        reframe: "真正需求是「版型不能跑」和「減少人工輸入」，不一定要重做文件。",
        solution: "用合併列印、巨集或欄位對應工具，在本機把資料填進既有 Word 範本。",
        conclusion: "課堂結論：AI 可以幫你找到 Word/Excel 本來就有的功能，甚至幫你寫 VBA，但敏感資料可以留在自己電腦。",
      },
      form: {
        tag: "資料回收",
        title: "表單常被填壞，先改流程而不是事後整理",
        before: "每次大家填回來格式都不同，再請 AI 幫忙整理成統一表格。",
        reframe: "問題不只在整理，而是輸入端就缺少限制，才讓資料變亂。",
        solution: "用 Word 內容控制項、下拉選單、核取方塊或 Google 表單，先把格式固定。",
        conclusion: "課堂結論：AI 可以提醒你有哪些既有工具可用，讓流程從源頭變乾淨。",
      },
      music: {
        tag: "授權判斷",
        title: "短影片配樂不一定要自己生成",
        before: "直接叫 AI 生一首配樂，放到活動影片或社群短片使用。",
        reframe: "真正需求是可商用、可公開播放、是否需標註、是否涉及 MÜST 或平台規範。",
        solution: "請 AI 協助找 CC 授權、免標註或可商用音樂庫，並列出使用限制。",
        conclusion: "課堂結論：AI 也可以當授權查詢助理，不一定只是生成音樂的工具。",
      },
      image: {
        tag: "隱私判斷",
        title: "修圖要思考原始照片能不能上傳",
        before: "把照片傳給 AI，請它修圖、改背景或做成影片。",
        reframe: "修圖通常需要原始照片，這會牽涉肖像、個資與平台使用條款。",
        solution: "先判斷照片是否可公開、是否有他人肖像；不確定時用示意圖或去識別化素材。",
        conclusion: "課堂結論：越貼近真實人物與公司資料，越需要先問自己能不能交給外部服務。",
      },
    };

    const fields = {
      tag: lab.querySelector("[data-workflow-tag]"),
      title: lab.querySelector("[data-workflow-title]"),
      before: lab.querySelector("[data-workflow-before]"),
      reframe: lab.querySelector("[data-workflow-reframe]"),
      solution: lab.querySelector("[data-workflow-solution]"),
      conclusion: lab.querySelector("[data-workflow-conclusion]"),
    };

    function renderWorkflow(key) {
      const item = workflowData[key];
      if (!item) return;
      Object.entries(fields).forEach(([field, element]) => {
        if (element) element.textContent = item[field];
      });
    }

    lab.querySelectorAll("[data-workflow-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-workflow-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderWorkflow(button.dataset.workflowChoice);
      });
    });

    renderWorkflow("docx");
  });

  document.querySelectorAll("[data-permission-lab]").forEach((lab) => {
    const permissionData = {
      ask: {
        mode: "ask",
        tag: "最保守",
        title: "一律詢問我",
        desc: "每次要編輯外部檔案或使用網路前先詢問，最適合初學者或不熟悉專案時使用。",
        conclusion: "課堂提醒：初學階段先保守，寧可多按幾次核准，也不要讓 AI 自由碰整台電腦。",
        screenTitle: "每次都先問",
        screenDesc: "編輯檔案前需核准",
      },
      auto: {
        mode: "auto",
        tag: "較有效率",
        title: "代我核准",
        desc: "簡單生成檔案或整理指定資料夾時比較順，但偵測到可能不安全操作仍要詢問。",
        conclusion: "課堂提醒：老師自己平時偏向此模式，但前提是只授權清楚的專案資料夾。",
        screenTitle: "一般操作自動通過",
        screenDesc: "高風險動作再詢問",
      },
      full: {
        mode: "full",
        tag: "不建議",
        title: "完整存取權",
        desc: "可無限制存取網路與電腦檔案，初學者不熟悉時風險太高。",
        conclusion: "課堂提醒：在非常熟悉以前，不要勾完整存取權，避免不小心刪到重要檔案。",
        screenTitle: "整台電腦都能碰",
        screenDesc: "初學階段不要開",
      },
    };

    const fields = {
      visual: lab.querySelector("[data-permission-visual]"),
      tag: lab.querySelector("[data-permission-tag]"),
      title: lab.querySelector("[data-permission-title]"),
      desc: lab.querySelector("[data-permission-desc]"),
      conclusion: lab.querySelector("[data-permission-conclusion]"),
      screenTitle: lab.querySelector("[data-permission-screen-title]"),
      screenDesc: lab.querySelector("[data-permission-screen-desc]"),
    };

    function renderPermission(key) {
      const item = permissionData[key];
      if (!item) return;
      if (fields.visual) fields.visual.dataset.mode = item.mode;
      Object.entries(fields).forEach(([field, element]) => {
        if (!element || field === "visual") return;
        element.textContent = item[field];
      });
    }

    lab.querySelectorAll("[data-permission-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab
          .querySelectorAll("[data-permission-choice]")
          .forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderPermission(button.dataset.permissionChoice);
      });
    });

    renderPermission("ask");
  });

  document.querySelectorAll("[data-need-game]").forEach((game) => {
    const cases = {
      schedule: {
        tag: "工作流程",
        pain: "每月要排很多人的班，規則複雜，臨時請假時還要重新檢查。",
        question: "AI 會先問：你最怕出錯的是人力不足、休假衝突，還是班距限制？",
        can: "先把排班規則拆成檢查清單，列出它還缺哪些條件。",
        output: "排班規則檢查表、請假情境判斷流程、可重複使用的排班小助手。",
        lesson: "需求越具體，AI 越能追問；資料越敏感，越要先去識別化。",
      },
      document: {
        tag: "文書流程",
        pain: "資料在 Excel，成品要放進固定 Word 格式，人工複製很慢又怕跑版。",
        question: "AI 會先問：你要保留的是欄位位置、表格版型，還是簽核文字？",
        can: "先整理欄位對應表，再建議合併列印、內容控制項或 VBA。",
        output: "可重複使用的 Word 範本流程，而不是每次重新生成一份文件。",
        lesson: "AI 不一定要看真實資料，也能幫你找到本機自動化方法。",
      },
      community: {
        tag: "社區工作",
        pain: "活動公告、LINE 提醒、志工招募和感謝文，每次都要重寫一遍。",
        question: "AI 會先問：你最常重複的是活動前、活動中，還是活動後的文字？",
        can: "整理成三段式文案模板，依對象和語氣快速改寫。",
        output: "招募文、提醒訊息、活動後感謝文，以及可複製的公告模板。",
        lesson: "把重複工作做成模板，AI 才能成為生活助理，而不是一次性代寫。",
      },
      travel: {
        tag: "生活專案",
        pain: "想規劃旅遊，但景點、交通、住宿、家人需求全混在一起。",
        question: "AI 會先問：你要先決定目的地、每日路線，還是交通與住宿比較？",
        can: "把限制條件拆成預算、天數、體力、交通、同行者偏好。",
        output: "每日行程表、交通查詢清單、住宿比較表與出發前備忘。",
        lesson: "旅遊規劃也能練需求盤點：先說清楚限制，再請 AI 排方案。",
      },
    };
    const fields = {
      tag: game.querySelector("[data-need-tag]"),
      score: game.querySelector("[data-need-score]"),
      meter: game.querySelector("[data-need-meter]"),
      pain: game.querySelector("[data-need-pain]"),
      question: game.querySelector("[data-need-question]"),
      can: game.querySelector("[data-need-can]"),
      output: game.querySelector("[data-need-output]"),
      lesson: game.querySelector("[data-need-lesson]"),
    };
    let activeCase = "schedule";
    const selectedChips = new Set();

    function renderNeed() {
      const item = cases[activeCase];
      const score = Math.min(100, 40 + selectedChips.size * 15);
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.score) fields.score.textContent = `專案成熟度 ${score}%`;
      if (fields.meter) fields.meter.style.width = `${score}%`;
      if (fields.pain) fields.pain.textContent = item.pain;
      if (fields.question) fields.question.textContent = item.question;
      if (fields.can) fields.can.textContent = score >= 70 ? item.can : "目前只能先幫你整理困擾，還需要補更多背景與限制。";
      if (fields.output) fields.output.textContent = score >= 85 ? item.output : "先產出追問清單與資料準備清單，再逐步變成專案。";
      if (fields.lesson) fields.lesson.textContent = score >= 100 ? "四個條件都補齊時，AI 才比較能給出可執行的第一步。" : item.lesson;
    }

    game.querySelectorAll("[data-need-case]").forEach((button) => {
      button.addEventListener("click", () => {
        activeCase = button.dataset.needCase;
        selectedChips.clear();
        game.querySelectorAll("[data-need-chip]").forEach((chip) => chip.classList.remove("is-selected"));
        game.querySelectorAll("[data-need-case]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderNeed();
      });
    });

    game.querySelectorAll("[data-need-chip]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.needChip;
        if (selectedChips.has(key)) selectedChips.delete(key);
        else selectedChips.add(key);
        button.classList.toggle("is-selected", selectedChips.has(key));
        renderNeed();
      });
    });

    renderNeed();
  });

  document.querySelectorAll("[data-branch-game]").forEach((game) => {
    const data = {
      branch: {
        count: "3 條",
        token: "中",
        clarity: "高",
        tag: "課堂示範",
        title: "建立分支，保留原本好答案",
        desc: "同一段對話可以分成 A、B、C 方向，讓你比較不同寫法或方案，不用把前面覺得好的內容蓋掉。",
        lesson: "課堂結論：分支不是為了炫功能，而是讓思考路線不互相污染。",
      },
      summary: {
        count: "1 條主線",
        token: "低",
        clarity: "高",
        tag: "Token 管理",
        title: "對話太長時，先壓縮成摘要",
        desc: "請 AI 整理目前目標、已決定內容、不要的方向和未解問題，再帶到新對話接續。",
        lesson: "課堂結論：長對話不是越長越好，摘要可以把記憶搬家。",
      },
      goal: {
        count: "2 條",
        token: "中",
        clarity: "拉回中",
        tag: "拉回主線",
        title: "把最終目標重新貼回對話",
        desc: "AI 開始發散時，明確提醒它：我最後想做出的成品是什麼、限制是什麼。",
        lesson: "課堂結論：AI 很會延伸，使用者要負責把方向拉回來。",
      },
      drift: {
        count: "很多岔路",
        token: "高",
        clarity: "低",
        tag: "反面示範",
        title: "一直亂問，答案會開始偏離",
        desc: "沒有分支、沒有摘要、沒有提醒目標時，AI 可能越聊越遠，甚至忘記前面真正要解決的問題。",
        lesson: "課堂結論：長對話要管理，不然看似很熱鬧，最後很難收斂成成果。",
      },
    };
    const fields = {
      screen: game.querySelector("[data-branch-screen]"),
      count: game.querySelector("[data-branch-count]"),
      token: game.querySelector("[data-branch-token]"),
      clarity: game.querySelector("[data-branch-clarity]"),
      tag: game.querySelector("[data-branch-tag]"),
      title: game.querySelector("[data-branch-title]"),
      desc: game.querySelector("[data-branch-desc]"),
      lesson: game.querySelector("[data-branch-lesson]"),
    };

    function renderBranch(key) {
      const item = data[key];
      if (!item) return;
      if (fields.screen) fields.screen.dataset.mode = key;
      ["count", "token", "clarity", "tag", "title", "desc", "lesson"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }

    game.querySelectorAll("[data-branch-action]").forEach((button) => {
      button.addEventListener("click", () => {
        game.querySelectorAll("[data-branch-action]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderBranch(button.dataset.branchAction);
      });
    });

    renderBranch("branch");
  });

  document.querySelectorAll("[data-flow-game]").forEach((game) => {
    const cases = {
      docx: {
        tag: "文書自動化",
        title: "保留 Word 版型，把 Excel 欄位自動填進去",
        problem: "如果直接叫 AI 重做整份 Word，很可能跑版，也不一定適合上傳真實名單。",
        label: "合併列印",
      },
      form: {
        tag: "資料回收",
        title: "大家填表格式亂，先把入口做乾淨",
        problem: "一直事後整理很累，真正問題可能是填寫端沒有下拉選單、核取方塊或必填限制。",
        label: "固定欄位",
      },
      music: {
        tag: "授權判斷",
        title: "短影片配樂要先看用途和授權",
        problem: "不是每個音樂都能商用或公開播放，AI 可以協助找授權來源與限制。",
        label: "授權清單",
      },
      photo: {
        tag: "隱私判斷",
        title: "照片修圖前先判斷能不能上傳",
        problem: "真實人物、工作場域或文件照片都可能涉及肖像與個資，未必適合丟到外部服務。",
        label: "去識別化",
      },
    };
    const choiceData = {
      upload: {
        result: "速度快，但容易忽略格式、授權或隱私問題。",
        safe: "風險偏高：如果資料含個資、公司文件或人物照片，不能直接丟。",
        lesson: "課堂結論：方便不是唯一標準，先判斷資料能不能給。",
      },
      local: {
        result: "這題適合讓 AI 幫你找既有功能、流程或本機自動化方法。",
        safe: "較安全：AI 可看欄位名稱和需求，不一定要看真實個資。",
        lesson: "課堂結論：AI 很適合當流程顧問，幫你找到本來就能用的工具。",
      },
      input: {
        result: "如果資料來源一直很亂，應該先改填寫表單或資料入口。",
        safe: "中高安全：從源頭降低錯誤，也能減少後續上傳與整理。",
        lesson: "課堂結論：有時候最好的 AI 專案，是先把人工流程設計好。",
      },
    };
    let activeCase = "docx";
    let activeChoice = "local";
    const fields = {
      tag: game.querySelector("[data-flow-tag]"),
      title: game.querySelector("[data-flow-title]"),
      problem: game.querySelector("[data-flow-problem]"),
      visual: game.querySelector("[data-flow-visual]"),
      svgLabel: game.querySelector("[data-flow-svg-label]"),
      result: game.querySelector("[data-flow-result]"),
      safe: game.querySelector("[data-flow-safe]"),
      lesson: game.querySelector("[data-flow-lesson]"),
    };

    function renderFlow() {
      const item = cases[activeCase];
      const choice = choiceData[activeChoice];
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.title) fields.title.textContent = item.title;
      if (fields.problem) fields.problem.textContent = item.problem;
      if (fields.visual) fields.visual.dataset.choice = activeChoice;
      if (fields.svgLabel) fields.svgLabel.textContent = item.label;
      if (fields.result) fields.result.textContent = choice.result;
      if (fields.safe) fields.safe.textContent = choice.safe;
      if (fields.lesson) fields.lesson.textContent = choice.lesson;
    }

    game.querySelectorAll("[data-flow-case]").forEach((button) => {
      button.addEventListener("click", () => {
        activeCase = button.dataset.flowCase;
        game.querySelectorAll("[data-flow-case]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderFlow();
      });
    });

    game.querySelectorAll("[data-flow-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        activeChoice = button.dataset.flowChoice;
        game.querySelectorAll("[data-flow-choice]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderFlow();
      });
    });

    renderFlow();
  });

  document.querySelectorAll("[data-agent-game]").forEach((game) => {
    const missions = {
      travel: "建立旅遊專案資料夾，產出行程草稿與資料清單。",
      rename: "整理課堂檔案名稱，可能需要批次改檔名。",
      web: "查詢旅遊資料並整理成清單，會需要網路搜尋。",
    };
    const permissions = {
      ask: {
        risk: "safe",
        tag: "建議設定",
        title: "一律詢問我",
        desc: "適合初學者：每次建立或修改檔案前都先確認，雖然慢一點，但不容易碰到課程外資料。",
        meter: 84,
        lesson: "課堂提醒：先把任務限制在指定資料夾，等熟悉後再提高自動化程度。",
      },
      auto: {
        risk: "medium",
        tag: "進階設定",
        title: "代我核准",
        desc: "適合已經確認資料夾範圍時使用，速度比較快，但仍要看清楚 Codex 打算做什麼。",
        meter: 62,
        lesson: "課堂提醒：老師平時可用這類模式，但前提是任務範圍很清楚。",
      },
      full: {
        risk: "danger",
        tag: "高風險",
        title: "完整存取權",
        desc: "初學者不建議。它可能碰到整台電腦與網路，錯誤操作的代價也變高。",
        meter: 22,
        lesson: "課堂提醒：不要因為方便就開最大權限，先保守才是真正會用工具。",
      },
    };
    let mission = "travel";
    let permission = "ask";
    const fields = {
      visual: game.querySelector("[data-agent-visual]"),
      tag: game.querySelector("[data-agent-tag]"),
      title: game.querySelector("[data-agent-title]"),
      desc: game.querySelector("[data-agent-desc]"),
      meter: game.querySelector("[data-agent-meter]"),
      lesson: game.querySelector("[data-agent-lesson]"),
    };

    function renderAgent() {
      const item = permissions[permission];
      if (fields.visual) fields.visual.dataset.risk = item.risk;
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.title) fields.title.textContent = item.title;
      if (fields.desc) fields.desc.textContent = `${missions[mission]} ${item.desc}`;
      if (fields.meter) fields.meter.style.width = `${item.meter}%`;
      if (fields.lesson) fields.lesson.textContent = item.lesson;
    }

    game.querySelectorAll("[data-agent-mission]").forEach((button) => {
      button.addEventListener("click", () => {
        mission = button.dataset.agentMission;
        game.querySelectorAll("[data-agent-mission]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderAgent();
      });
    });

    game.querySelectorAll("[data-agent-permission]").forEach((button) => {
      button.addEventListener("click", () => {
        permission = button.dataset.agentPermission;
        game.querySelectorAll("[data-agent-permission]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderAgent();
      });
    });

    renderAgent();
  });

  document.querySelectorAll("[data-excel-lab]").forEach((lab) => {
    const data = {
      top: {
        tag: "現場示範",
        title: "AI 找出投資支出最高",
        desc: "先分析類別彙總，再指出投資 128,500 為最高，其次是住宿。這是「讀資料」層級。",
        cell: "=MAX(H:H)",
        lesson: "課堂提醒：增益集會看見整份 Excel，真實資料要先判斷能不能給它讀。",
      },
      formula: {
        tag: "公式生成",
        title: "在 K2 寫入最高支出公式",
        desc: "增益集不只回答問題，還能嘗試寫公式、改寫函數並驗證，最後把結果放進指定儲存格。",
        cell: "=LARGE(H:H,1)",
        lesson: "課堂提醒：公式可以讓 AI 寫，但你仍要看懂結果是否符合需求。",
      },
      addin: {
        tag: "介面排障",
        title: "找不到按鈕時，用截圖問 AI",
        desc: "Mac、Windows、網頁版位置可能不同。截圖給 ChatGPT 或 Gemini，說明你卡在哪個畫面，請它一步一步帶你找。",
        cell: "截圖→問路",
        lesson: "課堂提醒：AI 也能幫你看軟體畫面，不一定只用來生成內容。",
      },
    };
    const fields = {
      tag: lab.querySelector("[data-excel-tag]"),
      title: lab.querySelector("[data-excel-title]"),
      desc: lab.querySelector("[data-excel-desc]"),
      cell: lab.querySelector("[data-excel-cell]"),
      steps: lab.querySelector("[data-excel-steps]"),
      lesson: lab.querySelector("[data-excel-lesson]"),
    };

    function renderExcel(key) {
      const item = data[key];
      if (!item) return;
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.title) fields.title.textContent = item.title;
      if (fields.desc) fields.desc.textContent = item.desc;
      if (fields.cell) fields.cell.textContent = item.cell;
      if (fields.lesson) fields.lesson.textContent = item.lesson;
      if (fields.steps) fields.steps.dataset.mode = key;
    }

    lab.querySelectorAll("[data-excel-task]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-excel-task]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderExcel(button.dataset.excelTask);
      });
    });

    renderExcel("top");
  });

  document.querySelectorAll("[data-video-factory]").forEach((factory) => {
    const data = {
      image: {
        img: "../assets/course07/frame-01.webp",
        badge: "4 秒動態",
        tag: "圖轉影片",
        title: "讓靜態照片動起來",
        desc: "給一張活動照片，要求在不破壞畫面元素的前提下，讓人物或鏡頭有自然動態。",
        cost: "約 4 秒，需扣積分",
        note: "免費版或不同平台可能有浮水印、秒數或額度限制。",
        lesson: "課堂結論：生影片很吃額度，生成前要先想清楚用途、秒數與畫面。",
      },
      frame: {
        img: "../assets/course07/frame-02.webp",
        badge: "首尾幀",
        tag: "首尾幀串接",
        title: "用第一張與最後一張控制方向",
        desc: "一段影片秒數有限，可以把上一段最後一幀接成下一段第一幀，慢慢串成長片。",
        cost: "適合長片分段生成",
        note: "中間動作仍由 AI 補，結果不會百分之百可控。",
        lesson: "課堂結論：首尾幀是在控制變化方向，不是保證每個細節都照劇本走。",
      },
      movie: {
        img: "../assets/course07/frame-03.webp",
        badge: "AI 成片",
        tag: "AI 成片",
        title: "照片加需求，讓 AI 先策劃腳本",
        desc: "左側對話助手讀照片後，先生成分鏡、旁白、字幕與配樂，再進入剪輯模式微調。",
        cost: "速度快，但仍要人工檢查",
        note: "簡體字、用詞、節奏常需要重新修正。",
        lesson: "課堂結論：AI 成片適合快速打樣，正式用途仍要人進剪輯台修。",
      },
      srt: {
        img: "../assets/course07/frame-04.webp",
        badge: "SRT",
        tag: "字幕修正",
        title: "長影片用 SRT 流程，短影片直接改字",
        desc: "短影音字少時直接重打最快；長訪談可匯出 SRT、簡轉繁、再匯回，但全片仍要重看改錯字。",
        cost: "1 小時節目可省約一半時間",
        note: "AI 聽打一定會有錯，最後一關永遠是人。",
        lesson: "課堂結論：同一個字幕功能，在短片和長訪談會有完全不同的工作流程。",
      },
    };
    const fields = {
      img: factory.querySelector("[data-video-image]"),
      stage: factory.querySelector("[data-video-stage]"),
      badge: factory.querySelector("[data-video-badge]"),
      tag: factory.querySelector("[data-video-tag]"),
      title: factory.querySelector("[data-video-title]"),
      desc: factory.querySelector("[data-video-desc]"),
      cost: factory.querySelector("[data-video-cost]"),
      note: factory.querySelector("[data-video-note]"),
      lesson: factory.querySelector("[data-video-lesson]"),
    };

    function renderVideo(key) {
      const item = data[key];
      if (!item) return;
      if (fields.img) fields.img.src = item.img;
      if (fields.stage) fields.stage.dataset.mode = key;
      ["badge", "tag", "title", "desc", "cost", "note", "lesson"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }

    factory.querySelectorAll("[data-video-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        factory.querySelectorAll("[data-video-mode]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderVideo(button.dataset.videoMode);
      });
    });

    renderVideo("image");
  });

  document.querySelectorAll("[data-splitter-lab]").forEach((lab) => {
    const data = {
      paper: {
        tag: "大工作拆小段",
        title: "論文不是一句話生完",
        desc: "先選資料來源、做大綱，再一章一章生成。若第二章偏掉，後面八萬字可能全部白寫。",
        ai: "整理可信資料與大綱",
        human: "判斷資料能不能用",
        output: "逐章產出，不一次丟十萬字",
        lesson: "課堂結論：高完成度工作要分段驗收，不能期待一次生成就交出去。",
      },
      loan: {
        tag: "語言變工具",
        title: "貸款試算工具靠一直試錯做出來",
        desc: "講師不懂程式也能用語言和 Claude 溝通，逐步做出可算月付金和總利息的網頁工具。",
        ai: "寫程式與修錯",
        human: "描述公式、測試結果",
        output: "可操作的小網頁工具",
        lesson: "課堂結論：你不必一開始就懂程式，但要能描述需求、看出結果怪不怪。",
      },
      subtitles: {
        tag: "字幕專業",
        title: "AI 聽打省時間，但全片仍要看完",
        desc: "一小時節目以前可能要 6 到 9 小時上字幕；AI 可縮短時間，但辨識錯字、斷句、時間軸仍需人工檢查。",
        ai: "初步辨識與 SRT",
        human: "逐句修字、斷句、對時間",
        output: "可用字幕，不只是自動稿",
        lesson: "課堂結論：AI 幫你省第一輪，專業判斷仍在最後一輪。",
      },
      resize: {
        tag: "小工具規格",
        title: "批次改圖不是一句話",
        desc: "50 張照片要改成 300×600，可以裁切、留白、等比縮放或硬壓變形。規格不清楚，Codex 就可能做錯。",
        ai: "寫批次處理程式",
        human: "說清楚裁切規則",
        output: "可重複執行的本機小工具",
        lesson: "課堂結論：AI 很像工讀生，交代越清楚，成果越接近你要的。",
      },
    };
    const fields = {
      tag: lab.querySelector("[data-split-tag]"),
      title: lab.querySelector("[data-split-title]"),
      desc: lab.querySelector("[data-split-desc]"),
      ai: lab.querySelector("[data-split-ai]"),
      human: lab.querySelector("[data-split-human]"),
      output: lab.querySelector("[data-split-output]"),
      lesson: lab.querySelector("[data-split-lesson]"),
    };

    function renderSplit(key) {
      const item = data[key];
      if (!item) return;
      Object.entries(fields).forEach(([field, element]) => {
        if (element) element.textContent = item[field];
      });
    }

    lab.querySelectorAll("[data-splitter-case]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-splitter-case]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderSplit(button.dataset.splitterCase);
      });
    });

    renderSplit("paper");
  });

  document.querySelectorAll("[data-codex-tool]").forEach((lab) => {
    const data = {
      fit: {
        mode: "fit",
        tag: "建議規格",
        title: "等比縮放，空白補底色",
        desc: "畫面不變形，也不裁掉人物，但可能上下或左右留白。適合文件報告裡需要完整保留照片內容。",
        lesson: "課堂提醒：把需求講清楚，AI 才不會像工讀生一樣照字面做錯。",
      },
      crop: {
        mode: "crop",
        tag: "可接受裁切",
        title: "中央裁切，畫面填滿 300×600",
        desc: "比例漂亮、沒有留白，但邊緣人物或背景可能被裁掉。適合縮圖、封面或固定欄位。",
        lesson: "課堂提醒：如果不能裁人物，提示詞就要明確說「不可裁掉主體」。",
      },
      stretch: {
        mode: "stretch",
        tag: "反面示範",
        title: "硬壓變形，最快但最危險",
        desc: "尺寸一定正確，但人物和畫面會被拉扁或拉長。除非真的只要填格子，否則通常不是好解法。",
        lesson: "課堂提醒：只說尺寸，不說規則，AI 可能選到你最不想要的方法。",
      },
    };
    const fields = {
      demo: lab.querySelector("[data-resize-mode]"),
      tag: lab.querySelector("[data-codex-tag]"),
      title: lab.querySelector("[data-codex-title]"),
      desc: lab.querySelector("[data-codex-desc]"),
      lesson: lab.querySelector("[data-codex-lesson]"),
    };

    function renderCodexTool(key) {
      const item = data[key];
      if (!item) return;
      if (fields.demo) fields.demo.dataset.resizeMode = item.mode;
      ["tag", "title", "desc", "lesson"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }

    lab.querySelectorAll("[data-codex-spec]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-codex-spec]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderCodexTool(button.dataset.codexSpec);
      });
    });

    renderCodexTool("fit");
  });

  document.querySelectorAll("[data-c08-pipeline]").forEach((lab) => {
    const scenes = {
      folder: `
        <svg class="pipeline-scene scene-folder" viewBox="0 0 780 360" role="img" aria-label="指定資料夾">
          <rect class="scene-bg" x="28" y="28" width="724" height="304" rx="20"></rect>
          <g class="big-folder">
            <path d="M96 112h150l22 30h210a22 22 0 0 1 22 22v128a22 22 0 0 1-22 22H96a22 22 0 0 1-22-22V134a22 22 0 0 1 22-22z"></path>
            <text x="158" y="220">招生影片素材</text>
          </g>
          <g class="photo-stack">
            <rect x="532" y="100" width="92" height="116" rx="8"></rect>
            <rect x="570" y="128" width="92" height="116" rx="8"></rect>
            <rect x="608" y="156" width="92" height="116" rx="8"></rect>
          </g>
          <g class="shield-mark">
            <path d="M388 174l48-18 48 18v34c0 42-30 66-48 74-18-8-48-32-48-74z"></path>
            <path d="M416 214l16 16 30-42"></path>
          </g>
          <path class="scene-dash" d="M486 228 C526 212 556 210 608 214"></path>
        </svg>`,
      brief: `
        <svg class="pipeline-scene scene-brief" viewBox="0 0 780 360" role="img" aria-label="說明影片需求">
          <rect class="scene-bg" x="28" y="28" width="724" height="304" rx="20"></rect>
          <g class="chat-card card-one">
            <rect x="86" y="82" width="250" height="82" rx="14"></rect>
            <text x="122" y="132">用途：招生</text>
          </g>
          <g class="chat-card card-two">
            <rect x="86" y="196" width="300" height="82" rx="14"></rect>
            <text x="122" y="246">風格：溫暖親切</text>
          </g>
          <g class="brief-board">
            <rect x="466" y="76" width="210" height="220" rx="18"></rect>
            <text x="570" y="126">需求單</text>
            <path d="M506 166h120M506 202h120M506 238h88"></path>
            <circle cx="488" cy="166" r="7"></circle>
            <circle cx="488" cy="202" r="7"></circle>
            <circle cx="488" cy="238" r="7"></circle>
          </g>
          <path class="scene-dash" d="M346 124 C410 124 410 138 466 150"></path>
          <path class="scene-dash dash-coral" d="M386 236 C430 236 428 220 466 214"></path>
        </svg>`,
      render: `
        <svg class="pipeline-scene scene-render" viewBox="0 0 780 360" role="img" aria-label="輸出影片版本">
          <rect class="scene-bg" x="28" y="28" width="724" height="304" rx="20"></rect>
          <g class="render-card wide">
            <rect x="72" y="96" width="224" height="126" rx="14"></rect>
            <path d="M132 160l42-28v56z"></path>
            <text x="184" y="254">橫式影片</text>
          </g>
          <g class="render-card phone">
            <rect x="356" y="70" width="104" height="184" rx="18"></rect>
            <path d="M392 162l32-22v44z"></path>
            <text x="408" y="286">手機直式</text>
          </g>
          <g class="render-card lively">
            <rect x="536" y="96" width="172" height="126" rx="14"></rect>
            <path d="M586 160l42-28v56z"></path>
            <text x="622" y="254">活潑版</text>
          </g>
          <path class="music-wave" d="M104 304 C150 276 194 334 240 304 S332 276 378 304 470 334 516 304 608 276 654 304"></path>
        </svg>`,
      review: `
        <svg class="pipeline-scene scene-review" viewBox="0 0 780 360" role="img" aria-label="產出審閱文件">
          <rect class="scene-bg" x="28" y="28" width="724" height="304" rx="20"></rect>
          <g class="story-doc">
            <rect x="82" y="70" width="430" height="230" rx="16"></rect>
            <rect x="112" y="108" width="112" height="64" rx="8"></rect>
            <rect x="112" y="202" width="112" height="64" rx="8"></rect>
            <path d="M252 120h190M252 150h146M252 214h190M252 244h120"></path>
          </g>
          <g class="comment-box">
            <rect x="548" y="102" width="154" height="168" rx="16"></rect>
            <text x="624" y="148">主管意見</text>
            <path d="M584 184h80M584 218h58"></path>
          </g>
          <path class="scene-dash" d="M512 184 C532 184 530 184 548 184"></path>
        </svg>`,
      skill: `
        <svg class="pipeline-scene scene-skill" viewBox="0 0 780 360" role="img" aria-label="整理成 Skill">
          <rect class="scene-bg" x="28" y="28" width="724" height="304" rx="20"></rect>
          <g class="reuse-sheet">
            <rect x="92" y="70" width="270" height="226" rx="18"></rect>
            <text x="228" y="118">工作說明書</text>
            <path d="M136 160h176M136 198h176M136 236h124"></path>
            <path class="tick-one" d="M112 156l12 12 22-30"></path>
            <path class="tick-two" d="M112 194l12 12 22-30"></path>
            <path class="tick-three" d="M112 232l12 12 22-30"></path>
          </g>
          <g class="reuse-arrow">
            <path d="M392 182h80"></path>
            <path d="M448 152l30 30-30 30"></path>
          </g>
          <g class="new-folder">
            <path d="M514 116h86l18 24h86a18 18 0 0 1 18 18v102a18 18 0 0 1-18 18H514a18 18 0 0 1-18-18V134a18 18 0 0 1 18-18z"></path>
            <text x="608" y="210">新照片</text>
          </g>
        </svg>`,
    };
    const data = {
      folder: {
        tag: "安全起點",
        title: "開一個新的資料夾，只授權這裡",
        desc: "Codex 能讀取與操作檔案，所以一開始就要把素材放進清楚的專案資料夾，讓它只在這個範圍工作。",
        output: "產出：可控的工作範圍，避免誤動其他檔案。",
      },
      brief: {
        tag: "需求說明",
        title: "把招生用途、風格、字幕、電話說清楚",
        desc: "不是只說「幫我做影片」，而是說明用途是招生、風格要溫暖親切、需要橫式與手機直式、結尾要有電話。",
        output: "產出：影片腳本、照片順序、字幕方向與規格設定。",
      },
      render: {
        tag: "成果輸出",
        title: "橫式、手機直式、活潑版分別輸出",
        desc: "同一批素材可以做成不同版本：橫式適合投影與網站，手機直式適合社群，活潑版測試更花俏的轉場。",
        output: "產出：mp4 影片、背景音樂、分鏡截圖與執行腳本。",
      },
      review: {
        tag: "審閱文件",
        title: "把影片拆成主管看得懂的分鏡表",
        desc: "Codex 反過來讀影片，擷取每段畫面、時間、字幕與目的，整理成可填修改意見的文件。",
        output: "產出：分鏡文件 md/docx，讓討論不只停在口頭感覺。",
      },
      skill: {
        tag: "重用流程",
        title: "整理成 Skill，下次換照片再套用",
        desc: "成功做出一次影片後，把輸入條件、產出規格、檢查清單和修改方式保存成使用說明書。",
        output: "產出：可重複使用的照片招生影片流程。",
      },
    };
    const fields = {
      visual: lab.querySelector("[data-pipeline-visual]"),
      tag: lab.querySelector("[data-pipeline-tag]"),
      title: lab.querySelector("[data-pipeline-title]"),
      desc: lab.querySelector("[data-pipeline-desc]"),
      output: lab.querySelector("[data-pipeline-output]"),
    };
    function renderPipeline(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) {
        fields.visual.dataset.step = key;
        if (scenes[key]) fields.visual.innerHTML = scenes[key];
      }
      ["tag", "title", "desc", "output"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-pipeline-step]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-pipeline-step]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderPipeline(button.dataset.pipelineStep);
      });
    });
    renderPipeline("folder");
  });

  document.querySelectorAll("[data-c08-video-lab]").forEach((lab) => {
    const videos = {
      horizontal: {
        src: "../assets/course08/videos/recruitment-horizontal.mp4",
        poster: "../assets/course08/previews/preview-main.webp",
        mode: "horizontal",
        tag: "第一批成果",
        title: "橫式招生影片",
        desc: "用 16:9 橫式輸出，適合投影、網站、一般橫式影片分享。腳本規劃約 42 秒，每段照片搭配招生字幕。",
        spec: "16:9 橫式",
        check: "字幕、照片順序、音樂音量與招生資訊。",
      },
      vertical: {
        src: "../assets/course08/videos/recruitment-vertical.mp4",
        poster: "../assets/course08/previews/preview-vertical-phone.webp",
        mode: "vertical",
        tag: "手機版本",
        title: "手機直式招生影片",
        desc: "改成 1080×1920、9:16 手機直式，使用模糊背景、放大照片與較大的字幕，最後補上招生電話。",
        spec: "9:16 手機直式",
        check: "電話是否正確、字幕是否夠大、照片裁切是否可接受。",
      },
      lively: {
        src: "../assets/course08/videos/recruitment-lively.mp4",
        poster: "../assets/course08/previews/contact-sheet.webp",
        mode: "lively",
        tag: "第二批測試",
        title: "活潑版招生影片",
        desc: "套用同一流程到新照片資料夾，測試更花俏、活潑的視覺版本，也觀察是否過度華麗。",
        spec: "橫式活潑版",
        check: "轉場是否太花、音樂是否合適、是否符合正式招生用途。",
      },
    };
    const fields = {
      player: lab.querySelector("[data-c08-video-player]"),
      shell: lab.querySelector("[data-c08-video-shell]"),
      tag: lab.querySelector("[data-c08-video-tag]"),
      title: lab.querySelector("[data-c08-video-title]"),
      desc: lab.querySelector("[data-c08-video-desc]"),
      spec: lab.querySelector("[data-c08-video-spec]"),
      check: lab.querySelector("[data-c08-video-check]"),
    };
    function renderVideo(key) {
      const item = videos[key];
      if (!item) return;
      if (fields.player) {
        fields.player.pause();
        fields.player.src = item.src;
        fields.player.poster = item.poster;
        fields.player.load();
      }
      if (fields.shell) fields.shell.dataset.mode = item.mode;
      ["tag", "title", "desc", "spec", "check"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-c08-video]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-c08-video]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderVideo(button.dataset.c08Video);
      });
    });
    renderVideo("horizontal");
  });

  document.querySelectorAll("[data-revision-lab]").forEach((lab) => {
    const data = {
      phone: {
        mode: "phone",
        tag: "補資訊",
        title: "把缺漏說成可執行的修改",
        before: "感覺怪怪的：最後一幕好像少了可以報名的資訊。",
        after: "可修改指令：直式影片最後一幕沒有電話資訊，請加入 05-277-0482 分機 9。",
        caption: "請加入電話：05-277-0482 分機 9",
      },
      small: {
        mode: "small",
        tag: "調畫面",
        title: "照片太小，要說可不可以裁切",
        before: "感覺怪怪的：手機畫面裡照片太小，看不清楚人物。",
        after: "可修改指令：請放大照片內容，可稍微裁切邊緣，但保留主要人物。",
        caption: "照片放大，邊緣可小幅裁切",
      },
      subtitle: {
        mode: "subtitle",
        tag: "調字幕",
        title: "手機觀看要加大字幕",
        before: "感覺怪怪的：手機上文字有點小，長輩可能看不清楚。",
        after: "可修改指令：請把手機直式版本字幕加大，並保留足夠對比。",
        caption: "手機字幕加大，提高對比",
      },
      motion: {
        mode: "motion",
        tag: "診斷原因",
        title: "不要只說卡卡，要問可能原因",
        before: "感覺怪怪的：照片放大效果有點抖、看起來不順。",
        after: "可修改指令：請分析放大效果不順的原因，檢查照片解析度、幀率與縮放曲線。",
        caption: "診斷縮放曲線與幀率",
      },
    };
    const fields = {
      preview: lab.querySelector("[data-phone-preview]"),
      tag: lab.querySelector("[data-revision-tag]"),
      title: lab.querySelector("[data-revision-title]"),
      before: lab.querySelector("[data-revision-before]"),
      after: lab.querySelector("[data-revision-after]"),
      caption: lab.querySelector("[data-revision-caption]"),
    };
    function renderRevision(key) {
      const item = data[key];
      if (!item) return;
      if (fields.preview) fields.preview.dataset.mode = item.mode;
      ["tag", "title", "before", "after", "caption"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-revision-case]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-revision-case]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderRevision(button.dataset.revisionCase);
      });
    });
    renderRevision("phone");
  });

  document.querySelectorAll("[data-storyboard-lab]").forEach((lab) => {
    const data = {
      opening: {
        image: "../assets/course08/previews/preview-main.webp",
        time: "0:00-0:05",
        title: "嘉義市婦女學苑 115 年度招生中",
        purpose: "用課程畫面開場，讓觀眾立刻知道這是婦女學苑招生影片。",
        review: "可確認年度、單位名稱與開場照片是否適合。",
      },
      dance: {
        image: "../assets/course08/previews/preview-main.webp",
        time: "0:05-0:10",
        title: "找回身體的活力",
        purpose: "用舞蹈與伸展畫面呈現健康、律動與生活感。",
        review: "可確認畫面是否夠有活力、人物裁切是否自然。",
      },
      digital: {
        image: "../assets/course08/previews/preview-main.webp",
        time: "0:25-0:30",
        title: "數位學習，跟上生活需求",
        purpose: "呈現婦女學苑不只傳統才藝，也包含貼近日常的數位課程。",
        review: "可確認這段是否要換成更明顯的 AI 或手機學習照片。",
      },
      info: {
        image: "../assets/course08/previews/preview-info.webp",
        time: "0:36-0:42",
        title: "報名資訊與聯絡電話",
        purpose: "保留足夠秒數，讓觀眾看清楚招生電話與下一步。",
        review: "重點檢查電話 05-277-0482 分機 9 是否正確。",
      },
    };
    const fields = {
      image: lab.querySelector("[data-storyboard-image]"),
      time: lab.querySelector("[data-storyboard-time]"),
      title: lab.querySelector("[data-storyboard-title]"),
      purpose: lab.querySelector("[data-storyboard-purpose]"),
      review: lab.querySelector("[data-storyboard-review]"),
    };
    function renderStoryboard(key) {
      const item = data[key];
      if (!item) return;
      if (fields.image) fields.image.src = item.image;
      ["time", "title", "purpose", "review"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-storyboard-scene]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-storyboard-scene]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderStoryboard(button.dataset.storyboardScene);
      });
    });
    renderStoryboard("opening");
  });

  document.querySelectorAll("[data-skill-lab]").forEach((lab) => {
    const data = {
      inputs: {
        sheetTitle: "照片招生影片工作說明書",
        tag: "素材規格",
        title: "先把照片、電話、用途放進資料夾",
        desc: "Skill 不是魔法，而是一份工作說明書。輸入條件越清楚，下次套用時越不容易跑偏。",
        lesson: "課堂結論：把成功流程保存下來，才是 AI 工作術的價值。",
        list: ["準備 6-8 張課程照片", "確認影片用途與招生電話", "把照片、電話、用途放進同一個資料夾"],
      },
      steps: {
        sheetTitle: "固定流程提醒卡",
        tag: "固定流程",
        title: "照片排序、字幕腳本、影片輸出分步做",
        desc: "流程要寫清楚：先讀照片、產腳本、做橫式、做直式、產分鏡、再檢查電話與字幕。",
        lesson: "課堂結論：流程越清楚，AI 越能把下一批素材照樣處理。",
        list: ["先讀照片並排順序", "產生招生字幕與腳本", "輸出橫式與手機直式", "最後產出分鏡審閱文件"],
      },
      checks: {
        sheetTitle: "發布前檢查清單",
        tag: "檢查清單",
        title: "80 分成果要靠人補最後 20 分",
        desc: "Skill 也要包含檢查項目：電話、年度、字幕大小、照片裁切、音樂音量、轉場風格。",
        lesson: "課堂結論：未檢查的 Skill 會把不完美流程也保存下來。",
        list: ["電話與年度是否正確", "字幕是否清楚可讀", "照片裁切是否自然", "音樂與轉場是否合適"],
      },
      reuse: {
        sheetTitle: "下次重做操作卡",
        tag: "套用重做",
        title: "新照片資料夾也能產出第二批影片",
        desc: "第八堂後段用新照片資料夾做出橫式、手機直式、活潑版，展示流程可重複。",
        lesson: "課堂結論：能重用，才代表這不是一次性的 AI 表演。",
        list: ["換成新的照片資料夾", "沿用同一份影片需求", "重新輸出橫式、直式與活潑版", "再做一次人工檢查"],
      },
    };
    const fields = {
      tag: lab.querySelector("[data-skill-tag]"),
      title: lab.querySelector("[data-skill-title]"),
      desc: lab.querySelector("[data-skill-desc]"),
      lesson: lab.querySelector("[data-skill-lesson]"),
      sheetTitle: lab.querySelector("[data-skill-sheet-title]"),
      list: lab.querySelector("[data-skill-list]"),
    };
    function renderSkill(key) {
      const item = data[key];
      if (!item) return;
      ["tag", "title", "desc", "lesson", "sheetTitle"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
      if (fields.list) {
        fields.list.innerHTML = item.list.map((line) => `<span>${line}</span>`).join("");
      }
    }
    lab.querySelectorAll("[data-skill-part]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-skill-part]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderSkill(button.dataset.skillPart);
      });
    });
    renderSkill("inputs");
  });

  document.querySelectorAll("[data-c09-triage]").forEach((lab) => {
    const data = {
      schedule: {
        tag: "排程案例",
        title: "AI 排 80 多堂課，結果只抓到約 30 堂",
        problem: "問題不是表格看起來漂不漂亮，而是原始課程有沒有全部出現、有沒有冒出不存在的測試課。",
        first: "直接請 AI 幫忙排課，結果看似有表格，但課程數量不對。",
        tool: "先固定欄位：課名、教室、日期、時段，再要求 AI 列出缺漏與衝突。",
        check: "AI 可以輔助排程，但最後要用 Excel 或人工名單核對總數、重複與不存在項目。",
        scene: `
          <div class="triage-scene triage-scene-schedule">
            <div class="mini-sheet"><b>原始課表</b><span>83 堂</span><span>10 間教室</span><span>日期 / 時段 / 講師</span></div>
            <div class="triage-machine"><i></i><strong>AI 初排</strong><em>只找到 30 堂</em></div>
            <div class="triage-result-list"><b>人工核對</b><span class="bad">漏排 53 堂</span><span class="bad">冒出測試課</span><span class="good">改用固定表格</span></div>
          </div>`,
      },
      ocr: {
        tag: "OCR 問診",
        title: "圖片 PDF 和手寫表格會快速消耗流量",
        problem: "掃描 PDF 若只是圖片，AI 必須先辨識文字；手寫內容更容易錯字、漏字，也更吃 Token。",
        first: "如果一次丟大量掃描檔，流量燒很快，還不一定知道錯在哪裡。",
        tool: "先挑 3 到 5 頁，用 Google Drive / OneNote 做 OCR，再請 AI 整理欄位。",
        check: "最後回到 Excel 或名冊核對姓名、電話、數字、欄位對齊與漏字。",
        scene: `
          <div class="triage-scene triage-scene-ocr">
            <div class="scan-stack"><span>100 頁 PDF</span><span>手寫備註</span><span>圖片掃描</span></div>
            <div class="token-alert"><strong>先停</strong><i></i><em>Token 壓力上升</em></div>
            <div class="triage-result-list"><b>修正流程</b><span class="good">先測 3 頁</span><span class="good">OCR 轉文字</span><span class="good">Excel 校正</span></div>
          </div>`,
      },
      qrcode: {
        tag: "本地工具",
        title: "免費 QR Code 網站可能有條款與轉付費風險",
        problem: "已印製海報若使用外部 QR Code 服務，未來服務轉付費或跳轉頁改變，會影響既有成品。",
        first: "先確認需求是否真的只是網址轉 QR Code，不要一開始做成大型系統。",
        tool: "用 Codex 做成本地 HTML 小工具，瀏覽器直接開啟，不依賴陌生網站。",
        check: "掃描正確、檔名清楚、能下載，並且未來服務條款改變也不影響已做好的工具。",
        scene: `
          <div class="triage-scene triage-scene-qrcode">
            <div class="warning-site">免費 QR 網站<br><small>條款 / 跳轉 / 付費風險</small></div>
            <div class="triage-machine"><i></i><strong>Codex</strong><em>改成本地網頁</em></div>
            <div class="qr-mini"><i></i><i></i><i></i><b></b><b></b><em></em><em></em></div>
          </div>`,
      },
      local: {
        tag: "本地模型",
        title: "隱私資料可先用本地模型做初步整理",
        problem: "本地模型不用把資料上傳到雲端，但能力受硬體限制，也會消耗 GPU、記憶體與電力。",
        first: "先查電腦規格，再從摘要、分類、翻譯這類小任務開始測。",
        tool: "Ollama、小型開放模型、本地摘要或翻譯流程；複雜判斷仍可用雲端 AI 討論。",
        check: "硬碟空間、記憶體、速度、輸出品質與人工查證，全部都要納入選擇。",
        scene: `
          <div class="triage-scene triage-scene-local">
            <div class="laptop-model"><b>本機</b><span>Ollama</span><span>小模型</span></div>
            <div class="model-pulse"><strong>隱私高</strong><em>推理有限</em></div>
            <div class="cloud-model"><b>雲端</b><span>能力強</span><span>先去識別</span></div>
          </div>`,
      },
    };
    const fields = {
      visual: lab.querySelector("[data-triage-visual]"),
      tag: lab.querySelector("[data-triage-tag]"),
      title: lab.querySelector("[data-triage-title]"),
      problem: lab.querySelector("[data-triage-problem]"),
      first: lab.querySelector("[data-triage-first]"),
      tool: lab.querySelector("[data-triage-tool]"),
      check: lab.querySelector("[data-triage-check]"),
    };
    function renderTriage(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) {
        fields.visual.dataset.case = key;
        fields.visual.innerHTML = item.scene;
      }
      ["tag", "title", "problem", "first", "tool", "check"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-triage-case]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-triage-case]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderTriage(button.dataset.triageCase);
      });
    });
    renderTriage("schedule");
  });

  document.querySelectorAll("[data-c09-ocr]").forEach((lab) => {
    const data = {
      sample: {
        tag: "小量測試",
        title: "先拿 3 到 5 頁測辨識率",
        desc: "不要一開始就丟 100 頁掃描 PDF。先看 AI 是否能讀出欄位、姓名、數字，再決定後續流程。",
        result: "結論：先知道可不可行，才不會把免費或付費流量一次燒完。",
        label: "Token 壓力：低",
        level: "28%",
        warning: "先測 3 頁，確認欄位和辨識率。",
        stage: `<div class="paper-stack"><span>PDF</span><span>IMG</span><span>手寫</span></div><div class="ocr-output-table"><b>測試結果</b><span>姓名：可辨識</span><span>電話：需校正</span><span>備註：手寫易錯</span></div>`,
      },
      drive: {
        tag: "前處理",
        title: "先用 Google Drive 或 OneNote 把圖片轉文字",
        desc: "如果公司已有 Google 或 Microsoft 工具，可先把圖片文字轉出來，再交給 AI 整理。",
        result: "結論：OCR 前處理做得好，AI 後面整理會更準。",
        label: "Token 壓力：中",
        level: "48%",
        warning: "先把圖片文字轉出來，AI 才能專心整理。",
        stage: `<div class="ocr-drive-scene"><div>掃描檔</div><i></i><div>Google / OneNote OCR</div><i></i><div>可複製文字</div></div>`,
      },
      notebook: {
        tag: "大量整理",
        title: "NotebookLM 適合整理資料包，但仍要檢查",
        desc: "NotebookLM 可處理多份資料與摘要，但掃描品質、欄位、手寫辨識仍會影響結果。",
        result: "結論：工具分工可以省力，但不能省掉人工校對。",
        label: "Token 壓力：中高",
        level: "64%",
        warning: "適合摘要與找重點，不代表每個欄位都正確。",
        stage: `<div class="notebook-scene"><span>資料包</span><span>摘要</span><span>來源回查</span><span>待校正欄位</span></div>`,
      },
      excel: {
        tag: "人工校正",
        title: "最後回到 Excel 樣板與名冊交叉比對",
        desc: "辨識後的資料要進固定欄位，姓名、數字和欄位對齊由人或既有名冊交叉檢查。",
        result: "結論：AI 可以整理，正式資料仍要可追蹤、可修正。",
        label: "Token 壓力：可控",
        level: "36%",
        warning: "正式資料要回到表格，才能查漏、排序、修正。",
        stage: `<div class="excel-check-scene"><b>Excel 校正表</b><span class="ok">姓名一致</span><span class="bad">電話缺碼</span><span class="ok">日期正確</span><span class="bad">手寫備註需人工看</span></div>`,
      },
    };
    const fields = {
      visual: lab.querySelector("[data-ocr-visual]"),
      tag: lab.querySelector("[data-ocr-tag]"),
      title: lab.querySelector("[data-ocr-title]"),
      desc: lab.querySelector("[data-ocr-desc]"),
      result: lab.querySelector("[data-ocr-result]"),
      label: lab.querySelector("[data-ocr-meter-label]"),
      meter: lab.querySelector("[data-ocr-meter]"),
      warning: lab.querySelector("[data-ocr-warning]"),
      stage: lab.querySelector("[data-ocr-stage]"),
    };
    function renderOcr(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) fields.visual.dataset.step = key;
      if (fields.meter) fields.meter.style.setProperty("--level", item.level);
      if (fields.stage) fields.stage.innerHTML = item.stage;
      ["tag", "title", "desc", "result", "label", "warning"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-ocr-step]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-ocr-step]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderOcr(button.dataset.ocrStep);
      });
    });
    renderOcr("sample");
  });

  document.querySelectorAll("[data-c09-prompt]").forEach((lab) => {
    const parts = {
      role: "我是公司職員，經常要把紙本表格、掃描檔或工作紀錄整理回電腦。",
      workflow: "目前流程是：先列印固定表格，請對方手寫填寫，再掃描成 PDF，最後要彙整成可檢查的資料表。",
      stuck: "我現在卡在：掃描 PDF 不一定能辨識，資料量很大，直接叫 AI 做成品會消耗很多流量。",
      guard: "在討論出結論之前，請不要生成檔案或報告。請先問我 3 個需要補充的問題，幫我找最省力、最安全的流程。",
      summary: "討論結束後，請整理成下次可以接續的重點文件，包含目標、已討論結論、卡關點與下一步。",
    };
    const output = lab.querySelector("[data-c09-prompt-output]");
    const buttons = Array.from(lab.querySelectorAll("[data-prompt-part]"));
    function renderPrompt() {
      const selected = buttons
        .filter((button) => button.classList.contains("is-selected"))
        .map((button) => ({ key: button.dataset.promptPart, text: parts[button.dataset.promptPart] }))
        .filter((part) => part.text);
      if (output) {
        output.innerHTML = selected
          .map((part, index) => `<p class="${part.key === "guard" ? "is-guard" : ""}"><span>${index + 1}</span>${part.text}</p>`)
          .join("");
      }
    }
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.toggle("is-selected");
        renderPrompt();
      });
    });
    renderPrompt();
  });

  document.querySelectorAll("[data-c09-safety]").forEach((lab) => {
    const data = {
      private: {
        mode: "private",
        tag: "先去識別化",
        title: "客戶、學生、同事名冊不能直接丟",
        desc: "姓名、電話、地址、生日和完整名冊都可能辨識個人。若要請 AI 分析，先改成 A、B、C，電話只留末三碼，地址只留城市。",
        action: "建議問法：請先幫我把以下資料去識別化，再進行整理。",
      },
      official: {
        mode: "official",
        tag: "一定要查證",
        title: "官方電話、日期、法規與金額不能只信 AI",
        desc: "AI 可能回答得很像真的，但電話、期限、金額、法規和官方網址都需要回到原始單位或可靠來源確認。",
        action: "建議問法：請列出剛才回答中哪些地方需要我自行查證，以及應該去哪裡查。",
      },
      codex: {
        mode: "codex",
        tag: "限制資料夾",
        title: "會改檔案的 AI，要先說清楚邊界",
        desc: "使用 Codex 或 AI 代理時，要先備份，只開本次專案資料夾，並把不同專案分開放。",
        action: "建議問法：在修改前，請先列出你打算新增、修改、刪除哪些檔案，等我確認後再執行。",
      },
      media: {
        mode: "media",
        tag: "發布前檢查",
        title: "照片、影片、字幕和音樂都要看過",
        desc: "公開分享前，要確認人物照片是否合適、字幕是否正確、音樂是否可用、畫面是否有隱私或不適合內容。",
        action: "建議問法：請幫我列一份發布前檢查清單，包含隱私、字幕、音樂、照片授權與錯字。",
      },
    };
    const fields = {
      gate: lab.querySelector("[data-safety-gate]"),
      tag: lab.querySelector("[data-safety-tag]"),
      title: lab.querySelector("[data-safety-title]"),
      desc: lab.querySelector("[data-safety-desc]"),
      action: lab.querySelector("[data-safety-action]"),
    };
    function renderSafety(key) {
      const item = data[key];
      if (!item) return;
      if (fields.gate) fields.gate.dataset.mode = item.mode;
      ["tag", "title", "desc", "action"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-safety-case]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-safety-case]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderSafety(button.dataset.safetyCase);
      });
    });
    renderSafety("private");
  });

  document.querySelectorAll("[data-c09-tool]").forEach((lab) => {
    const data = {
      risk: {
        mode: "risk",
        tag: "先看風險",
        title: "免費 QR Code 網站不一定適合長期印刷品",
        desc: "如果海報已經印出來，但 QR 服務未來轉付費、改跳轉或停止服務，就會影響既有成品。",
        lesson: "課堂結論：不是每個免費網站都能放心放進正式工作流程。",
        story: `<div class="warning-site">免費 QR 網站<br><small>條款 / 跳轉 / 付費風險</small></div><div class="tool-arrow">→</div><div class="local-file">本地 HTML<br><small>瀏覽器直接開</small></div>`,
      },
      overbuild: {
        mode: "overbuild",
        tag: "需求太滿",
        title: "一開始把 QR、圖片工具和小遊戲混在一起，AI 容易迷路",
        desc: "課堂示範提醒：不同作品放在同一個資料夾、需求一次講太多，AI 代理會比較容易改錯地方或卡住。",
        lesson: "修正方法：一個資料夾只放一個工具，先寫清楚最小目標。",
        story: `<div class="folder-chaos"><span>QR 工具</span><span>圖片工具</span><span>小遊戲</span><b>同一包需求</b></div><div class="tool-arrow warn">→</div><div class="tool-error">AI 不確定<br><small>到底要先做哪一個</small></div>`,
      },
      fail: {
        mode: "fail",
        tag: "第一版卡關",
        title: "第一版遇到套件載入失敗，這不是失敗，是縮小需求的訊號",
        desc: "上課時提到 AI 代理也可能遇到套件或環境問題。這時不是繼續加功能，而是先回到能跑起來的最小版本。",
        lesson: "修正方法：改成單一 HTML、內嵌必要程式碼、先確認瀏覽器打得開。",
        story: `<div class="console-error"><b>QR Code 套件載入失敗</b><span>library not found</span><span>preview blank</span></div><div class="tool-arrow warn">→</div><div class="local-file">縮小重做<br><small>單一 HTML 先能跑</small></div>`,
      },
      minimal: {
        mode: "minimal",
        tag: "縮小重做",
        title: "先做一個貼網址就能產生 QR Code 的版本",
        desc: "需求一開始不要太大。先確認本機網頁可以開、QR Code 可以生成，再逐步增加批次、命名、下載。",
        lesson: "課堂結論：AI 代理也會卡關，先做最小可用版最穩。",
        story: `<div class="url-box">https://women-ai.local/course</div><div class="qr-demo"><i></i><i></i><i></i><b></b><b></b><b></b><em></em></div>`,
      },
      qrcode: {
        mode: "qrcode",
        tag: "實際產出",
        title: "課堂生成的本地 QR Code 工具可以直接開在瀏覽器",
        desc: "這個工具能在本機產生 QR Code，不需要把內容上傳到陌生網站。畫面中嵌入的是課程資料夾內實際產出的網頁工具。",
        lesson: "課堂結論：簡單、重複、可離線的工作，很適合做成本地小工具。",
        frame: "../assets/course09/tools/qrcode/index.html",
      },
      image: {
        mode: "image",
        tag: "延伸產物",
        title: "同一堂課也嘗試做成本地圖片編輯工具",
        desc: "圖片工具展示了另一種方向：不是只生成內容，而是把常用操作做成可重複開啟的本地工具。",
        lesson: "課堂結論：工具可以很小，但要讓使用者看得懂、知道下一步怎麼操作。",
        frame: "../assets/course09/tools/image-editor/index.html",
      },
    };
    const fields = {
      visual: lab.querySelector("[data-tool-visual]"),
      story: lab.querySelector("[data-tool-story]"),
      frame: lab.querySelector("[data-tool-frame]"),
      tag: lab.querySelector("[data-tool-tag]"),
      title: lab.querySelector("[data-tool-title]"),
      desc: lab.querySelector("[data-tool-desc]"),
      lesson: lab.querySelector("[data-tool-lesson]"),
    };
    function renderTool(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) fields.visual.dataset.mode = item.mode;
      if (fields.story) {
        fields.story.hidden = Boolean(item.frame);
        fields.story.innerHTML = item.story || "";
      }
      if (fields.frame) {
        fields.frame.hidden = !item.frame;
        if (item.frame) fields.frame.src = item.frame;
      }
      ["tag", "title", "desc", "lesson"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-tool-part]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-tool-part]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderTool(button.dataset.toolPart);
      });
    });
    renderTool("risk");
  });

  document.querySelectorAll("[data-c09-model]").forEach((lab) => {
    const data = {
      cloud: {
        mode: "cloud",
        tag: "適合複雜任務",
        title: "雲端大模型適合推理、規劃與高品質生成",
        desc: "ChatGPT、Gemini、Claude 這類雲端工具通常能力較強，適合複雜流程討論，但不適合直接上傳敏感資料。",
        tip: "建議：可先去識別化，再用雲端 AI 討論流程與檢查清單。",
        values: ["42%", "92%", "18%", "72%"],
        flow: ["去識別摘要", "雲端 AI 討論流程", "人工查證"],
      },
      local: {
        mode: "local",
        tag: "適合隱私初稿",
        title: "本地模型適合摘要、翻譯、分類與初步整理",
        desc: "Ollama 這類工具可在本機跑模型，資料不必上傳雲端，但模型越小，複雜推理能力通常越有限。",
        tip: "建議：先查硬體規格，從小模型與簡單任務開始測。",
        values: ["86%", "46%", "88%", "58%"],
        flow: ["敏感原文", "本機小模型初整", "人工抽查"],
      },
      hybrid: {
        mode: "hybrid",
        tag: "最像真實流程",
        title: "敏感資料本地前處理，複雜判斷交給雲端",
        desc: "先用本地工具去識別化或做初步整理，再把不敏感的摘要交給雲端 AI 討論流程、產生檢查清單。",
        tip: "建議：把資料分級，決定哪一段能上雲端、哪一段留本機。",
        values: ["72%", "78%", "62%", "82%"],
        flow: ["本地去識別", "雲端規劃", "回本機核對"],
      },
    };
    const fields = {
      visual: lab.querySelector("[data-model-visual]"),
      flow: lab.querySelector(".model-flow"),
      tag: lab.querySelector("[data-model-tag]"),
      title: lab.querySelector("[data-model-title]"),
      desc: lab.querySelector("[data-model-desc]"),
      tip: lab.querySelector("[data-model-tip]"),
    };
    function renderModel(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) {
        fields.visual.dataset.mode = item.mode;
        fields.visual.querySelectorAll("i").forEach((bar, index) => {
          bar.style.setProperty("--value", item.values[index] || "50%");
        });
      }
      if (fields.flow) fields.flow.innerHTML = item.flow.map((step, index) => `${index ? "<b>→</b>" : ""}<span>${step}</span>`).join("");
      ["tag", "title", "desc", "tip"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-model-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-model-choice]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderModel(button.dataset.modelChoice);
      });
    });
    renderModel("cloud");
  });

  document.querySelectorAll("[data-c09-present]").forEach((lab) => {
    const data = {
      doc: {
        tag: "可展示成果",
        title: "文件整理或對話摘要也可以上台分享",
        lines: [
          "我這次做的是：把一段工作需求整理成 AI 可以接續處理的文件。",
          "我使用 AI 的方式是：先請它問問題，再整理重點與下一步。",
          "我學到最重要的一件事是：成果不一定要完美，但要能檢查。",
        ],
      },
      table: {
        tag: "排程成果",
        title: "表格和排程重點是交叉檢查",
        lines: [
          "我這次做的是：用 AI 協助整理課程、場地、時間或名冊。",
          "我使用 AI 的方式是：請它先找缺漏，再用表格輸出讓我核對。",
          "我學到最重要的一件事是：看起來完整不代表真的沒有漏。",
        ],
      },
      video: {
        tag: "影音成果",
        title: "影片、歌曲、字幕都能分享製作過程",
        lines: [
          "我這次做的是：把照片、文字或故事變成影片、歌曲或分鏡。",
          "我使用 AI 的方式是：先生成草稿，再修改字幕、畫面和用途。",
          "我學到最重要的一件事是：AI 成品要經過人工審閱才適合發布。",
        ],
      },
      tool: {
        tag: "工具成果",
        title: "小工具失敗紀錄也能變成果",
        lines: [
          "我這次做的是：嘗試用 AI 做一個本地端小工具。",
          "我使用 AI 的方式是：先做最小可用版，再逐步加功能。",
          "我學到最重要的一件事是：需求太大時，要先縮小範圍。",
        ],
      },
      process: {
        tag: "流程成果",
        title: "把怎麼問 AI 整理出來，就是很好的成果",
        lines: [
          "我這次做的是：整理一套自己下次還能使用的 AI 問法。",
          "我使用 AI 的方式是：請它整理目標、卡關、結論和下一步。",
          "我學到最重要的一件事是：真正的能力是知道怎麼問、怎麼改、怎麼查。",
        ],
      },
    };
    const fields = {
      visual: lab.querySelector("[data-present-visual]"),
      tag: lab.querySelector("[data-present-tag]"),
      title: lab.querySelector("[data-present-title]"),
      lines: lab.querySelector("[data-present-lines]"),
    };
    function renderPresent(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) {
        fields.visual.innerHTML = item.lines
          .map((line, index) => `<div class="speech-card"><span>${index + 1}</span><p>${line}</p></div>`)
          .join("");
      }
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.title) fields.title.textContent = item.title;
      if (fields.lines) {
        fields.lines.innerHTML = item.lines.map((line) => `<li>${line}</li>`).join("");
      }
    }
    lab.querySelectorAll("[data-present-type]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-present-type]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderPresent(button.dataset.presentType);
      });
    });
    renderPresent("doc");
  });

  document.querySelectorAll("[data-c10-present]").forEach((lab) => {
    const data = {
      doc: {
        mode: "doc",
        tag: "文件成果",
        title: "把工作需求整理成可接續的文件",
        lines: [
          "我這次做的是：把一段工作需求整理成 AI 可以接續處理的文件。",
          "我使用 AI 的方式是：先請它問問題，再整理重點與下一步。",
          "我學到最重要的一件事是：成果不一定要完美，但要能檢查。",
        ],
        tip: "提醒：分享時可以說明哪一段是 AI 草稿，哪一段是自己修改。",
      },
      table: {
        mode: "table",
        tag: "表格成果",
        title: "把名單、排程或資料整理成可核對表格",
        lines: [
          "我這次做的是：用 AI 協助整理表格、排程或名單資料。",
          "我使用 AI 的方式是：請它先找缺漏與衝突，再輸出可檢查欄位。",
          "我學到最重要的一件事是：表格看起來完整，不代表內容一定正確。",
        ],
        tip: "提醒：上台時可以展示檢查方法，例如總數、漏排、重複或人工校正欄位。",
      },
      music: {
        mode: "music",
        tag: "音樂成果",
        title: "把故事、心情或活動主題變成歌曲",
        lines: [
          "我這次做的是：用 AI 把生活故事或課程主題變成一首歌。",
          "我使用 AI 的方式是：先寫歌詞，再調整曲風、段落與版本。",
          "我學到最重要的一件事是：好聽之外，還要注意用途和授權。",
        ],
        tip: "提醒：如果播放歌曲，先確認音量、版本、歌詞是否適合公開播放。",
      },
      video: {
        mode: "video",
        tag: "影音成果",
        title: "把照片、字幕、分鏡整理成可討論影片",
        lines: [
          "我這次做的是：把照片或課程素材整理成影片或分鏡文件。",
          "我使用 AI 的方式是：請它產生初版，再依主管或同學意見修改。",
          "我學到最重要的一件事是：影片不是終點，還要能被審閱和修正。",
        ],
        tip: "提醒：影片公開前要檢查人物肖像、字幕、電話、音樂與畫面比例。",
      },
      tool: {
        mode: "tool",
        tag: "工具成果",
        title: "把重複工作做成本地網頁小工具",
        lines: [
          "我這次做的是：嘗試用 AI 做一個可重複使用的小工具。",
          "我使用 AI 的方式是：先做最小可用版，再慢慢增加功能。",
          "我學到最重要的一件事是：需求太大時，要先縮小範圍。",
        ],
        tip: "提醒：展示工具時可以說明第一版卡在哪裡、最後怎麼縮小重做。",
      },
      process: {
        mode: "process",
        tag: "流程成果",
        title: "把怎麼問 AI、怎麼修正整理成下次能用的流程",
        lines: [
          "我這次做的是：整理一套自己下次還能使用的 AI 問法或流程。",
          "我使用 AI 的方式是：請它整理目標、卡關點、結論與下一步。",
          "我學到最重要的一件事是：真正有用的是知道怎麼問、怎麼改、怎麼查。",
        ],
        tip: "提醒：流程成果可以不用漂亮，但要讓別人看懂你如何一步一步完成。",
      },
    };
    const fields = {
      visual: lab.querySelector("[data-c10-present-visual]"),
      tag: lab.querySelector("[data-c10-present-tag]"),
      title: lab.querySelector("[data-c10-present-title]"),
      lines: lab.querySelector("[data-c10-present-lines]"),
      tip: lab.querySelector("[data-c10-present-tip]"),
    };
    function renderPresent(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) fields.visual.dataset.mode = item.mode;
      if (fields.tag) fields.tag.textContent = item.tag;
      if (fields.title) fields.title.textContent = item.title;
      if (fields.lines) fields.lines.innerHTML = item.lines.map((line) => `<li>${line}</li>`).join("");
      if (fields.tip) fields.tip.textContent = item.tip;
    }
    lab.querySelectorAll("[data-c10-present-type]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-c10-present-type]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderPresent(button.dataset.c10PresentType);
      });
    });
    renderPresent("doc");
  });

  document.querySelectorAll("[data-c10-check]").forEach((lab) => {
    const data = {
      privacy: {
        mode: "privacy",
        tag: "先去識別化",
        title: "照片、名冊、LINE 對話都要先看能不能公開",
        desc: "公開成果網站不放完整姓名、電話、LINE 截圖原圖或未同意的人像。必要時用示意圖、局部截圖或去識別化版本代替。",
        action: "上台前問自己：這個畫面如果被公開分享，會不會透露他人的個資或公司資料？",
        visual: `<div class="check-item is-blocked">姓名電話</div><div class="check-gate">遮</div><div class="check-item is-safe">匿名版本</div>`,
      },
      accuracy: {
        mode: "accuracy",
        tag: "回到來源",
        title: "AI 寫得順，不代表電話、日期、數字都正確",
        desc: "成果若包含官方電話、報名日期、金額、課程時段或統計結果，要回到原始資料、官方來源或人工表格核對。",
        action: "上台前問自己：我能指出這個數字或資訊是從哪裡來的嗎？",
        visual: `<div class="check-item">AI 草稿</div><div class="check-gate">查</div><div class="check-item is-safe">來源確認</div>`,
      },
      copyright: {
        mode: "copyright",
        tag: "授權判斷",
        title: "歌曲、圖片、影片和模板要確認用途",
        desc: "AI 生成內容也要看平台規則、素材來源與公開用途。課堂展示可先用，但公開網站、招生或商業用途要更仔細確認。",
        action: "上台前問自己：這個素材可以公開播放或放到網站上嗎？",
        visual: `<div class="check-item">音樂圖片</div><div class="check-gate">問</div><div class="check-item is-safe">可展示版本</div>`,
      },
      tool: {
        mode: "tool",
        tag: "實測可用",
        title: "小工具要確認能開、能操作、能重做",
        desc: "如果展示 Codex 或本地網頁工具，先確認檔案路徑、按鈕、輸入輸出、下載與手機或投影畫面是否正常。",
        action: "上台前問自己：如果現場網路不穩，這個工具還能展示嗎？",
        visual: `<div class="check-item">本地工具</div><div class="check-gate">測</div><div class="check-item is-safe">可展示</div>`,
      },
    };
    const fields = {
      visual: lab.querySelector("[data-c10-check-visual]"),
      tag: lab.querySelector("[data-c10-check-tag]"),
      title: lab.querySelector("[data-c10-check-title]"),
      desc: lab.querySelector("[data-c10-check-desc]"),
      action: lab.querySelector("[data-c10-check-action]"),
    };
    function renderCheck(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) {
        fields.visual.dataset.mode = item.mode;
        fields.visual.innerHTML = item.visual;
      }
      ["tag", "title", "desc", "action"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-c10-check-case]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-c10-check-case]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderCheck(button.dataset.c10CheckCase);
      });
    });
    renderCheck("privacy");
  });

  document.querySelectorAll("[data-c10-map]").forEach((lab) => {
    const data = {
      office: {
        mode: "office",
        tag: "適合日常工作",
        title: "把文件、表格、會議、排程變得更好整理",
        desc: "從提示詞四要素開始，接到排班、會議紀錄、OCR、Excel 校正。最適合常處理名單、表格、文件與行政流程的學員。",
        next: "下一步：選一個每週都會重複做的表格，先讓 AI 幫你找欄位、缺漏與檢查清單。",
        nodes: ["C01 問清楚", "C04 表格排程", "C09 檢查"],
      },
      media: {
        mode: "media",
        tag: "適合創作分享",
        title: "把故事、照片、活動變成歌曲、影片與分鏡",
        desc: "C05 的音樂、C07 的影片生成、C08 的招生影片與分鏡文件，可以接成影音創作路線。",
        next: "下一步：挑 6 張照片或一段故事，先做 30 秒版本，再請 AI 幫你列出可修改處。",
        nodes: ["C05 歌曲", "C07 影片", "C08 分鏡"],
      },
      workflow: {
        mode: "workflow",
        tag: "適合改造流程",
        title: "把卡關工作拆成 AI 可以協助的步驟",
        desc: "C06 的個人專案、C08 的 Skill、C09 的問診與安全檢查，能幫學員把一次成果變成可重複流程。",
        next: "下一步：寫下你工作中最卡的一件事，請 AI 先問 3 個問題，不要急著生成成品。",
        nodes: ["C06 專案", "C08 Skill", "C09 問診"],
      },
      tool: {
        mode: "tool",
        tag: "適合做小工具",
        title: "把簡單重複的需求做成本地網頁工具",
        desc: "從 Codex 讀資料夾、製作影片，到 C09 的本地 QR Code 工具，重點是先做最小可用版。",
        next: "下一步：找一個只需要輸入、轉換、下載的小任務，先做單一功能版本。",
        nodes: ["C07 Codex", "C08 自動化", "C09 本地工具"],
      },
      safe: {
        mode: "safe",
        tag: "適合長期使用",
        title: "把隱私、授權、查證變成每次使用 AI 的習慣",
        desc: "從第一堂不貼個資，到後半段的 Codex 權限、本地模型、公開前檢查，這是每條路線都需要的底盤。",
        next: "下一步：替自己的常用 AI 任務寫一張安全檢查卡，包含要遮、要查、要限制的項目。",
        nodes: ["C01 隱私", "C08 權限", "C09 安全"],
      },
    };
    const fields = {
      visual: lab.querySelector("[data-c10-map-visual]"),
      tag: lab.querySelector("[data-c10-map-tag]"),
      title: lab.querySelector("[data-c10-map-title]"),
      desc: lab.querySelector("[data-c10-map-desc]"),
      next: lab.querySelector("[data-c10-map-next]"),
    };
    function renderMap(key) {
      const item = data[key];
      if (!item) return;
      if (fields.visual) {
        fields.visual.dataset.mode = item.mode;
        fields.visual.innerHTML = item.nodes.map((node, index) => `${index ? '<div class="map-line"></div>' : ''}<div class="map-node ${index < 2 ? 'is-hot' : ''}">${node}</div>`).join("");
      }
      ["tag", "title", "desc", "next"].forEach((field) => {
        if (fields[field]) fields[field].textContent = item[field];
      });
    }
    lab.querySelectorAll("[data-c10-map-path]").forEach((button) => {
      button.addEventListener("click", () => {
        lab.querySelectorAll("[data-c10-map-path]").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
        renderMap(button.dataset.c10MapPath);
      });
    });
    renderMap("office");
  });

  document.querySelectorAll("[data-c10-wall]").forEach((lab) => {
    const form = lab.querySelector("[data-c10-wall-form]");
    const board = lab.querySelector("[data-c10-wall-board]");
    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    if (!form || !board) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim() || "匿名學員";
      const mood = String(formData.get("mood") || "我做到了").trim();
      const message = String(formData.get("message") || "").trim();
      if (!message) return;
      const card = document.createElement("article");
      card.innerHTML = `<span>${escapeHtml(mood)}</span><p>${escapeHtml(name)}：${escapeHtml(message)}</p>`;
      board.prepend(card);
      form.reset();
    });
  });

  document.querySelectorAll("[data-schedule-showcase]").forEach((lab) => {
    const steps = {
      voice: {
        kicker: "第一步",
        title: "先把規則用說的倒出來",
        body:
          "排班規則太多，直接打字很慢。課堂先把班別、同仁限制、請假需求和排班習慣用語音說出來，再請 AI 整理成條列規則。",
        result: "得到：一份可讀的排班規則草稿，但還不能直接排班。"
      },
      questions: {
        kicker: "第二步",
        title: "先請 AI 問問題，不要直接排",
        body:
          "學員把規則交給 Gemini 後，重點不是立刻要班表，而是問它：依照目前資料，還缺什麼？哪裡可能會排錯？",
        result: "得到：AI 找出班別時間、週五服務空缺、指定休假等需要補充的地方。"
      },
      rules: {
        kicker: "第三步",
        title: "把隱藏規則補進去",
        body:
          "很多排班規則其實藏在經驗裡，不一定一開始說得出來。課堂用追加口述的方式，把 AI 問到的缺口補齊。",
        result: "得到：更完整的排班限制，AI 才能開始產出比較可靠的班表。"
      },
      system: {
        kicker: "第四步",
        title: "從一次排班變成網頁系統",
        body:
          "課堂成果不只是一張表，而是做出可以切換月份、套用請假情境、查看統計與匯出 CSV 的網頁排班工具。",
        result: "得到：一個可以被操作、被展示，也能留存為課程成果的工具。"
      },
      check: {
        kicker: "最後一步",
        title: "人工檢查讓成果變可靠",
        body:
          "AI 可以整理和產出，但最後仍要回到人來確認規則是否正確。課堂特別檢查 B 同仁 6/23 原本就未排班，避免多做不必要的重排。",
        result: "得到：課堂結論是先查證、再修改，AI 是助手，不是最後裁判。"
      }
    };

    const buttons = Array.from(lab.querySelectorAll("[data-schedule-step]"));
    const stage = lab.querySelector("[data-schedule-stage]");
    const kicker = lab.querySelector("[data-schedule-kicker]");
    const title = lab.querySelector("[data-schedule-title]");
    const body = lab.querySelector("[data-schedule-body]");
    const result = lab.querySelector("[data-schedule-result]");

    function render(step) {
      const item = steps[step] || steps.voice;
      buttons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.scheduleStep === step);
      });
      if (stage) stage.dataset.stage = step;
      if (kicker) kicker.textContent = item.kicker;
      if (title) title.textContent = item.title;
      if (body) body.textContent = item.body;
      if (result) result.textContent = item.result;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        render(button.dataset.scheduleStep);
      });
    });

    render("voice");
  });

  document.querySelectorAll("[data-quiz]").forEach((quiz) => {
    const questions = Array.from(quiz.querySelectorAll("[data-quiz-question]"));
    const result = quiz.querySelector(".quiz-result");
    const answers = new Map();
    const quizName =
      quiz.dataset.quizName ||
      document.querySelector(".brand small")?.textContent?.trim().split(/\s+/)[0] ||
      "這堂課";

    function updateResult() {
      const answered = answers.size;
      const correct = Array.from(answers.values()).filter(Boolean).length;
      if (!result) return;

      const title = result.querySelector("strong");
      const detail = result.querySelector("small");
      if (!title || !detail) return;

      title.textContent = `完成 ${answered} / ${questions.length} 題`;
      if (answered < questions.length) {
        detail.textContent = `答完五題後，這裡會顯示你的 ${quizName} 小檢查結果。`;
        return;
      }

      title.textContent = `小檢查完成：答對 ${correct} / ${questions.length} 題`;
      detail.textContent =
        correct === questions.length
          ? `太好了，${quizName} 的核心觀念都有抓住。`
          : "已經完成檢查，可以回頭看紅色選項的說明，再試著用自己的例子問 AI。";
    }

    questions.forEach((question, index) => {
      question.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const isCorrect = button.dataset.correct === "true";
          const feedback = question.querySelector(".quiz-feedback");

          question.classList.add("is-answered");
          question.querySelectorAll("button").forEach((choice) => {
            choice.classList.remove("is-correct", "is-wrong", "is-selected-answer");
            choice.disabled = false;
          });

          button.classList.add(isCorrect ? "is-correct" : "is-wrong", "is-selected-answer");
          answers.set(index, isCorrect);

          if (feedback) {
            feedback.textContent = isCorrect
              ? "答對了。AI 是好用的助手，但最後仍要由人判斷。"
              : "再想一下。重點是：AI 給草稿，人做檢查。";
          }

          updateResult();
        });
      });
    });

    updateResult();
  });

  const commentStatus = document.querySelector("[data-comment-status]");
  if (commentStatus) {
    const status = commentStatus.dataset.commentStatus;
    if (status === "open") {
      commentStatus.querySelector("strong").textContent = "留言開放中";
      commentStatus.querySelector("small").textContent = "請輸入暱稱與課程心得";
    }
    if (status === "archived") {
      commentStatus.querySelector("strong").textContent = "留言已關閉";
      commentStatus.querySelector("small").textContent = "保留精選留言作為成果展示";
    }
  }
})();
