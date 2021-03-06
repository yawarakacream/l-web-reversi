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

  // ================================================================
  // 変数
  //
  // ファイル全体で使うであろう変数は纏めて上の方に置いておく
  // ================================================================

  // セルの状態
  // 2 次元配列で管理すると簡単．size × size で中身が CellColor.EMPTY の 2 次元配列を作ろう
  const cells = undefined; /* ******** 実装しよう ******** */
  // BONUS: 1 行でも書ける

  return; // うまくいったら外そう

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
    /* ******** 実装しよう ******** */

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

  return; // うまくいったら外そう

  // 盤を用意したらセルに石を置きたくなる
  // セルは cells という変数で表していたのであった
  // cells 変数を HTML に反映させる処理を書く
  // プログラミングではふつう左上を原点にとった座標系を考える (さらに、下方向を x、右方向を y とすることが多い)
  const updateDisplay = () => {
    // 各セルに `cell(${x},${y})` という名前をつけていたので、これを getElementById すれば要素が取得できる
    // 取得した要素.dataset["color"] = CellColor.WHITE; のようにすると石が描画されるように予め用意してある
    /* ******** 実装しよう ******** */
  };

  // 初期配置をして HTML に反映させてみよう
  cells[3][3] = CellColor.WHITE;
  cells[4][4] = CellColor.WHITE;
  cells[3][4] = CellColor.BLACK;
  cells[4][3] = CellColor.BLACK;
  updateDisplay();

  return; // うまくいったら外そう

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
        /* ******** 実装しよう ******** */
      }
    }
  };
  addEventListeners();

  return; // うまくいったら外そう

  // ある石を置いたときにひっくり返せる石を求める関数を作ろう
  // x, y に color が置かれたときひっくり返せる石の座標の配列を返す
  //
  // ex.) findReversibleCells(0, 0, ColorStatus.BLACK) => [[1, 1], [1, 2]]
  //      (0, 0) に黒い石が置かれると (1, 1), (1, 2) にある白い石をひっくり返せる
  const findReversibleCells = (x, y, color) => {
    /* ******** 実装しよう ******** */
  };

  // 石を置いて手番を進める関数を作ろう
  // (x, y) に現在の手番の石を置く
  // findReversibleCells を用いてひっくり返せるものをひっくり返す
  // ゲームの終了判定：すべてのセルに石が置かれている / すべての石の色が同じ ならば終了
  // 手番を交代し、パスの確認など
  const proceedTurn = (x, y) => {
    /* ******** 実装しよう ******** */
  };
};

main();
