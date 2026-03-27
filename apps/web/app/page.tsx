"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export default function Home() {
  const [workspaces, setWorkspaces] = useState([]);

  const [boards, setBoards] = useState({});
  const [lists, setLists] = useState({});
  const [cards, setCards] = useState({});

  const [workspaceName, setWorkspaceName] = useState("");
  const [boardName, setBoardName] = useState({});
  const [listName, setListName] = useState({});
  const [cardTitle, setCardTitle] = useState({});

  // -------- FETCH --------

  const fetchWorkspaces = async () => {
    const res = await api.get("/workspaces");
    setWorkspaces(res.data);
  };

  const fetchBoards = async (workspaceId: string) => {
    const res = await api.get("/boards", {
      headers: { "x-workspace-id": workspaceId },
    });
    setBoards((prev) => ({ ...prev, [workspaceId]: res.data }));
  };

  const fetchLists = async (boardId: string) => {
    const res = await api.get("/lists", { params: { boardId } });
    setLists((prev) => ({ ...prev, [boardId]: res.data }));
  };

  const fetchCards = async (listId: string) => {
    const res = await api.get("/cards", { params: { listId } });
    setCards((prev) => ({ ...prev, [listId]: res.data }));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // -------- UI --------

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Workspace App</h1>

      {/* Create Workspace */}
      <div className="mb-6">
        <input
          className="border p-2 mr-2"
          placeholder="New workspace"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded"
          onClick={async () => {
            await api.post("/workspaces", { name: workspaceName });
            setWorkspaceName("");
            fetchWorkspaces();
          }}
        >
          Add Workspace
        </button>
      </div>

      {/* Workspaces */}
      {workspaces.map((ws: any) => (
        <div key={ws.id} className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="font-bold text-lg">{ws.name}</h2>

          <button
            className="text-blue-500 text-sm mb-2"
            onClick={() => fetchBoards(ws.id)}
          >
            Load Boards
          </button>

          {/* Create Board */}
          <div className="mb-2">
            <input
              className="border p-1 mr-2"
              placeholder="New board"
              value={boardName[ws.id] || ""}
              onChange={(e) =>
                setBoardName({ ...boardName, [ws.id]: e.target.value })
              }
            />
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={async () => {
                await api.post(
                  "/boards",
                  { name: boardName[ws.id] },
                  { headers: { "x-workspace-id": ws.id } },
                );
                fetchBoards(ws.id);
                setBoardName({ ...boardName, [ws.id]: "" });
              }}
            >
              Add Board
            </button>
          </div>

          {/* Boards */}
          {(boards[ws.id] || []).map((board: any) => (
            <div key={board.id} className="ml-4 mb-4 p-3 bg-gray-50 rounded">
              <h3 className="font-semibold">{board.name}</h3>

              <button
                className="text-green-600 text-sm"
                onClick={() => fetchLists(board.id)}
              >
                Load Lists
              </button>

              {/* Create List */}
              <div className="mb-2">
                <input
                  className="border p-1 mr-2"
                  placeholder="New list"
                  value={listName[board.id] || ""}
                  onChange={(e) =>
                    setListName({
                      ...listName,
                      [board.id]: e.target.value,
                    })
                  }
                />
                <button
                  className="bg-purple-500 text-white px-2 py-1 rounded"
                  onClick={async () => {
                    await api.post("/lists", {
                      name: listName[board.id],
                      boardId: board.id,
                      order: 0,
                    });
                    fetchLists(board.id);
                    setListName({ ...listName, [board.id]: "" });
                  }}
                >
                  Add List
                </button>
              </div>

              {/* Lists */}
              {(lists[board.id] || []).map((list: any) => (
                <div
                  key={list.id}
                  className="ml-4 mb-3 p-2 bg-white rounded border"
                >
                  <h4>{list.name}</h4>

                  <button
                    className="text-purple-600 text-xs"
                    onClick={() => fetchCards(list.id)}
                  >
                    Load Cards
                  </button>

                  {/* Create Card */}
                  <div className="mb-2">
                    <input
                      className="border p-1 mr-2"
                      placeholder="New card"
                      value={cardTitle[list.id] || ""}
                      onChange={(e) =>
                        setCardTitle({
                          ...cardTitle,
                          [list.id]: e.target.value,
                        })
                      }
                    />
                    <button
                      className="bg-orange-500 text-white px-2 py-1 rounded"
                      onClick={async () => {
                        await api.post("/cards", {
                          title: cardTitle[list.id],
                          listId: list.id,
                          order: 0,
                        });
                        fetchCards(list.id);
                        setCardTitle({
                          ...cardTitle,
                          [list.id]: "",
                        });
                      }}
                    >
                      Add Card
                    </button>
                  </div>

                  {/* Cards */}
                  {(cards[list.id] || []).map((card: any) => (
                    <div key={card.id} className="p-1 mb-1 bg-gray-100 rounded">
                      {card.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
