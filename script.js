// ================================================================
// リバーシ（オセロ）をつくる！
//
// 表示部分は雑に済ませる；最低限は用意してある
// ロジックを書いて JavaScript を学ぼう
//
// みやすさのためにちょっとレガシーな記法を使ったりする
// モダンさを目指すのは TypeScript に入ってからでいい
//
// レガシーなこと一覧：
// ・コメントの記法
// ・<table> タグ
// ・そもそも全体を class に入れた方がいい
// ================================================================

// Strict モードを有効にする
"use strict";

// 講義の都合上、途中で処理を止めたくなるので、処理全体をひとつの関数とする
const main = () => {
  // ================================================================
  // 定数
  //
  // プログラム中に謎の数字が出てきたりするとよくわからなくなるので
  // そういうものは定数として定義しておく
  // ================================================================

  // 盤の大きさ
  // リバーシは縦横 8 セルの正方形状の盤を使う
  // そのため 8 はよく出てくる値のはずだが、定数として定義しておく
  const size = 8;

  // セルの状態まとめ
  const CellColor = {
    EMPTY: "empty",
    BLACK: "black",
    WHITE: "white",
  };

  // AI を有効にするか
  const enableAi = true;

  // AI が思考に使う最小の時間 [ms]
  // これを入れないと一瞬で手を指してしまったりする
  const aiInterval = 1000;

  // AI の手番の色
  const aiColor = CellColor.WHITE;

  // ================================================================
  // 変数
  //
  // ファイル全体で使うであろう変数は纏めて上の方に置いておく
  // ================================================================

  // セルの状態
  // 2 次元配列で管理すると簡単．size × size で中身が CellColor.EMPTY の 2 次元配列を作ろう
  const cells = new Array(size);
  for (let i = 0; i < size; i++) {
    cells[i] = new Array(size);
    cells[i].fill(CellColor.EMPTY);
  }
  // BONUS: 1 行でも書ける

  // ホバーされているセル
  let hoveredCell = null;

  // 現在の手番
  let player = CellColor.BLACK;

  // ================================================================
  // ロジック：準備編
  //
  // 積極的に関数を定義してロジックを作り上げていく
  // ================================================================

  // まず HTML に盤を用意しよう
  // HTML に 1 セルずつ書いてもよいが、size 行 size 列（= size^2 = 64）書くのは大変なので JavaScript で生成してみる
  const prepareTable = () => {
    // 盤は 2 次元の表として表現できる
    // 今回は <table> タグ（表を作る最も簡単な方法）を使おう

    // まずは <table> を作る
    // document.createElement 関数を使うと要素を生成できる（引数にタグの名前を入れる）
    const table = document.createElement("table");

    // ただ createElement するだけでは HTML に反映されない
    // board に appendChild してあげて、Devtools で確認してみよう
    // id を設定した HTML の要素は document.getElementById で取得できる
    const board = document.getElementById("board");
    board.appendChild(table);

    // <table> の中身を作る
    // 一行ずつ詰めていく
    for (let x = 0; x < size; x++) {
      // 行は <tr> で表す
      const row = document.createElement("tr");
      table.appendChild(row);

      for (let y = 0; y < size; y++) {
        // セルは <td> で表す
        const cell = document.createElement("td");

        // .id で id を設定できる
        // 適当に x, y から一意に定まる名前をつけておく
        cell.id = `cell(${x},${y})`;

        row.appendChild(cell);
      }
    }

    // <table> タグの使い方：
    // <tr> が行、<td> がセルを表す
    // 全体を <table> で囲う
    //
    // <table>
    //   <tr>
    //     <td>A</td>
    //     <td>B</td>
    //   </tr>
    //   <tr>
    //     <td>C</td>
    //     <td>D</td>
    //   </tr>
    // </table>
    //
    // ↓
    //
    // ---------
    // | A | B |
    // ---------
    // | D | E |
    // ---------
  };
  prepareTable();

  // 盤を用意したらセルに石を置きたくなる
  // セルは cells という変数で表していたのであった
  // cells 変数を HTML に反映させる処理を書く
  const updateDisplay = () => {
    // 各セルに `cell(${x},${y})` という名前をつけていたので、これを getElementById すれば要素が取得できる
    // 取得した要素.dataset["color"] = CellColor.WHITE; のようにすると石が描画されるように予め用意してある
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const cell = document.getElementById(`cell(${x},${y})`);

        // ホバーの対応
        if (hoveredCell !== null && hoveredCell.x === x && hoveredCell.y === y) {
          cell.dataset["pre"] = true;
          cell.dataset["color"] = player;
        } else {
          cell.dataset["pre"] = false;
          cell.dataset["color"] = cells[x][y];
        }
      }
    }
  };

  // 初期配置をして HTML に反映させてみよう
  cells[3][3] = CellColor.WHITE;
  cells[4][4] = CellColor.WHITE;
  cells[3][4] = CellColor.BLACK;
  cells[4][3] = CellColor.BLACK;
  updateDisplay();

  // ================================================================
  // ロジック：ゲーム本体編
  //
  // マウスクリックなどによってゲームを進行させる
  // ================================================================

  // ユーザーの動作を検知してゲームを進めることを考えよう
  // addEventListener(イベント名, 関数)：ユーザーが特定の動作をしたとき、関数を実行する
  // この関数を リスナー、一連の流れを イベントが発火する という
  // イベントリスナーの中に複雑な処理は書かない
  const addEventListeners = () => {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const cell = document.getElementById(`cell(${x},${y})`);

        // ユーザーがクリックしたとき："click" イベント
        cell.addEventListener("click", () => {
          // 「AI が有効」かつ「AI の手番」ならば何もしない
          if (enableAi && player === aiColor) {
            return;
          }

          // 石が置けないセルなら何もしない
          if (!canPlace(x, y, player)) {
            return;
          }

          // 手番を進める
          proceedTurn(x, y);
        });

        // ユーザーがマウスを上にやったとき："mouseenter" イベント
        cell.addEventListener("mouseenter", () => {
          // 「AI が有効」かつ「AI の手番」ならば何もしない
          if (enableAi && player === aiColor) {
            return;
          }

          if (canPlace(x, y, player)) {
            hoveredCell = { x, y };
          } else {
            hoveredCell = null;
          }
          updateDisplay();
        });
      }
    }
  };
  addEventListeners();

  // ある石を置いたときにひっくり返せる石を求める関数を作ろう
  // x, y に color が置かれたときひっくり返せる石の座標の配列を返す
  //
  // ex.) findReversibleCells(0, 0, ColorStatus.BLACK) => [[1, 1], [1, 2]]
  //      (0, 0) に黒い石が置かれると (1, 1), (1, 2) にある白い石をひっくり返せる
  const findReversibleCells = (x, y, color) => {
    // 既に石が置かれていたら空配列
    if (cells[x][y] !== CellColor.EMPTY) {
      return [];
    }

    // ひっくり返せる石がある方向は上下左右・上上左... で 8 種考えられる
    // 1 方向について調べる関数を用意して、あとでまとめるのが簡単だろう
    // JavaScript は関数の中に関数を定義できる
    const findByDirection = (dx, dy) => {
      let ret = [];
      let reversible = false;
      let x1 = x + dx;
      let y1 = y + dy;
      while (0 <= x1 && x1 < size && 0 <= y1 && y1 < size) {
        if (cells[x1][y1] === CellColor.EMPTY) {
          break;
        }
        if (cells[x1][y1] === color) {
          reversible = true;
          break;
        }
        ret.push([x1, y1]);
        x1 += dx;
        y1 += dy;
      }
      return reversible ? ret : [];
    };

    const ret = [];
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) {
          continue;
        }
        ret.push(...findByDirection(dx, dy));
      }
    }
    return ret;
  };

  // 石が置けるかどうかを判定する
  const canPlace = (x, y, color) => findReversibleCells(x, y, color).length !== 0;

  // 石を置いて手番を進める関数を作ろう
  // (x, y) に現在の手番の石を置く
  // findReversibleCells を用いてひっくり返せるものをひっくり返す
  // ゲームの終了判定：すべてのセルに石が置かれている / すべての石の色が同じ ならば終了
  // 手番を交代し、パスの確認など
  const proceedTurn = (x, y) => {
    // 石をひっくり返す・置く
    const reversibles = findReversibleCells(x, y, player);
    reversibles.forEach(([x1, y1]) => {
      cells[x1][y1] = player;
    });
    cells[x][y] = player;

    // ホバーを解除
    hoveredCell = null;

    // 描画
    updateDisplay();

    console.log(`proceedTurn: ${player} put (${x}, ${y})`);

    // 手番を交代
    player = player === CellColor.BLACK ? CellColor.WHITE : CellColor.BLACK;

    const cellsData = [...new Array(size).keys()]
      .flatMap((x) => [...new Array(size).keys()].map((y) => [x, y]))
      .map(([x, y]) => ({
        color: cells[x][y],
        length: findReversibleCells(x, y, player).length,
      }));

    const blacks = cellsData.filter(({ color }) => color === CellColor.BLACK).length;
    const whites = cellsData.filter(({ color }) => color === CellColor.WHITE).length;

    // すべてのセルの色が同じ、または EMPTY でなければ終了
    if (blacks === 0 || whites === 0 || blacks + whites === size * size) {
      console.log(
        `proceedTurn: GAME SET! ${
          blacks === whites
            ? "draw"
            : `${blacks < whites ? CellColor.WHITE : CellColor.BLACK} won (${blacks} vs ${whites})`
        }`
      );
      return;
    }

    // 交代した手番の人が石を置けるセルがなければパス
    if (cellsData.every(({ length }) => length === 0)) {
      console.log(`proceedTurn: ${player} passed`);
      player = player === CellColor.BLACK ? CellColor.WHITE : CellColor.BLACK;
    }

    // 「AI が有効」かつ「AI の手番になった」ならば AI の処理を行う
    if (enableAi && player === aiColor) {
      // setTimeout を使うと処理を遅らせることができる
      setTimeout(() => proceedTurn(...executeAi()), aiInterval);
    }
  };

  // AI の処理を書こう
  // どの (x, y) に石を置くかを返す
  const executeAi = () => {
    // 座標とひっくり返せるセルの個数をまとめた配列の配列
    let reversibles = [...new Array(size).keys()]
      .flatMap((x) => [...new Array(size).keys()].map((y) => [x, y]))
      .map(([x, y]) => [x, y, findReversibleCells(x, y, player).length])
      .filter((c) => c[2] > 0);

    if (reversibles.length === 0) {
      return [];
    }

    // 一番ひっくり返せるものだけでフィルタしたりできる
    // const max = Math.max(...reversibles.map((e) => e[2]));
    // reversibles = reversibles.filter((c) => c[2] === max);

    return reversibles[Math.floor(Math.random() * reversibles.length)];
  };
};

main();
