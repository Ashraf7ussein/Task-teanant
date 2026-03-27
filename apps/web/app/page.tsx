"use client";

import { useEffect, useMemo, useState } from "react";
import BoardCard from "../components/BoardCard";
import CardItem from "../components/CardItem";
import ListCard from "../components/ListCard";
import WorkspaceCard from "../components/WorspaceCard";
import { api, getErrorMessage } from "../utils/api";

type Workspace = { id: string; name: string };
type Board = { id: string; name: string; workspaceId?: string };
type List = { id: string; name: string; boardId: string; order: number };
type Card = {
  id: string;
  title: string;
  content?: string | null;
  listId: string;
  order: number;
};

type CardBucket = { listId: string; items: Card[] };
type CardDraft = { listId: string; value: string };
type LoadingState = {
  workspaces: boolean;
  boards: boolean;
  lists: boolean;
  cards: boolean;
  createWorkspace: boolean;
};

const inputClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500";
const primaryButtonClassName =
  "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300";
const secondaryButtonClassName =
  "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400";

export default function Home() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [cardsByList, setCardsByList] = useState<CardBucket[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  );
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [boardName, setBoardName] = useState("");
  const [listName, setListName] = useState("");
  const [cardDrafts, setCardDrafts] = useState<CardDraft[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    workspaces: false,
    boards: false,
    lists: false,
    cards: false,
    createWorkspace: false,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    setLoading((prev) => ({ ...prev, workspaces: true }));
    setError(null);

    try {
      const res = await api.get<Workspace[]>("/workspaces");
      setWorkspaces(res.data);

      if (res.data.length === 0) {
        setSelectedWorkspaceId(null);
        setSelectedBoardId(null);
        setBoards([]);
        setLists([]);
        setCardsByList([]);
        return;
      }

      const firstWorkspaceId = res.data[0]?.id ?? null;

      setSelectedWorkspaceId((prev) =>
        prev && res.data.some((workspace) => workspace.id === prev)
          ? prev
          : firstWorkspaceId,
      );
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading((prev) => ({ ...prev, workspaces: false }));
    }
  };

  const fetchBoards = async (workspaceId: string) => {
    setLoading((prev) => ({ ...prev, boards: true }));
    setError(null);

    try {
      const res = await api.get<Board[]>("/boards", {
        headers: { "x-workspace-id": workspaceId },
      });

      setBoards(res.data);
      setLists([]);
      setCardsByList([]);
      setSelectedBoardId((prev) =>
        prev && res.data.some((board) => board.id === prev)
          ? prev
          : (res.data[0]?.id ?? null),
      );
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading((prev) => ({ ...prev, boards: false }));
    }
  };

  const fetchLists = async (boardId: string) => {
    setLoading((prev) => ({ ...prev, lists: true }));
    setError(null);

    try {
      const res = await api.get<List[]>("/lists", { params: { boardId } });
      setLists(res.data);

      const cardGroups = await Promise.all(
        res.data.map(async (list) => ({
          listId: list.id,
          items: await fetchCards(list.id, true),
        })),
      );

      setCardsByList(cardGroups);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading((prev) => ({ ...prev, lists: false }));
    }
  };

  const fetchCards = async (listId: string, silent = false) => {
    if (!silent) {
      setLoading((prev) => ({ ...prev, cards: true }));
      setError(null);
    }

    try {
      const res = await api.get<Card[]>("/cards", { params: { listId } });
      if (!silent) {
        setCardsByList((prev) => {
          const remaining = prev.filter((entry) => entry.listId !== listId);
          return [...remaining, { listId, items: res.data }];
        });
      }

      return res.data;
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
      return [];
    } finally {
      if (!silent) {
        setLoading((prev) => ({ ...prev, cards: false }));
      }
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceId) {
      return;
    }

    setBoardName("");
    fetchBoards(selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!selectedBoardId) {
      return;
    }

    setListName("");
    fetchLists(selectedBoardId);
  }, [selectedBoardId]);

  const selectedWorkspace = useMemo(
    () =>
      workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ??
      null,
    [selectedWorkspaceId, workspaces],
  );

  const getCardsForList = (listId: string) =>
    cardsByList.find((entry) => entry.listId === listId)?.items ?? [];

  const getCardDraft = (listId: string) =>
    cardDrafts.find((entry) => entry.listId === listId)?.value ?? "";

  const setCardDraft = (listId: string, value: string) => {
    setCardDrafts((prev) => {
      const existing = prev.some((entry) => entry.listId === listId);

      if (!existing) {
        return [...prev, { listId, value }];
      }

      return prev.map((entry) =>
        entry.listId === listId ? { ...entry, value } : entry,
      );
    });
  };

  const submitWorkspace = async () => {
    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      return;
    }

    setLoading((prev) => ({ ...prev, createWorkspace: true }));
    setError(null);

    try {
      await api.post("/workspaces", { name: trimmedName });
      setWorkspaceName("");
      await fetchWorkspaces();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading((prev) => ({ ...prev, createWorkspace: false }));
    }
  };

  const submitBoard = async () => {
    const trimmedName = boardName.trim();
    if (!selectedWorkspaceId || !trimmedName) {
      return;
    }

    try {
      await api.post(
        "/boards",
        { name: trimmedName },
        { headers: { "x-workspace-id": selectedWorkspaceId } },
      );
      setBoardName("");
      await fetchBoards(selectedWorkspaceId);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  const submitList = async () => {
    const trimmedName = listName.trim();
    if (!selectedBoardId || !trimmedName) {
      return;
    }

    try {
      await api.post("/lists", {
        name: trimmedName,
        boardId: selectedBoardId,
        order: lists.length,
      });
      setListName("");
      await fetchLists(selectedBoardId);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  const submitCard = async (listId: string) => {
    const trimmedTitle = getCardDraft(listId).trim();
    if (!trimmedTitle) {
      return;
    }

    try {
      await api.post("/cards", {
        title: trimmedTitle,
        listId,
        order: getCardsForList(listId).length,
      });
      setCardDraft(listId, "");
      await fetchCards(listId);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between p-lg">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900">
                Workspace collaboration dashboard
              </h1>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <input
                className={`${inputClassName} sm:min-w-64`}
                placeholder="Create a workspace"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
              />
              <button
                type="button"
                className={primaryButtonClassName}
                onClick={submitWorkspace}
                disabled={loading.createWorkspace || !workspaceName.trim()}
              >
                {loading.createWorkspace ? "Creating..." : "Add workspace"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        <section className="grid gap-6 xl:grid-cols-[280px_320px_minmax(0,1fr)]">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Workspaces
                </h2>
                <p className="text-sm text-slate-500">
                  Tenant-safe workspace list
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  isActive={workspace.id === selectedWorkspaceId}
                  detail={
                    workspace.id === selectedWorkspaceId
                      ? `${boards.length} boards loaded`
                      : "Click to open"
                  }
                  onClick={() => {
                    setSelectedWorkspaceId(workspace.id);
                    setSelectedBoardId(null);
                  }}
                />
              ))}

              {!loading.workspaces && workspaces.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                  No workspaces yet. Create one to get started.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Boards</h2>
                <p className="text-sm text-slate-500">
                  {selectedWorkspace
                    ? `Inside ${selectedWorkspace.name}`
                    : "Choose a workspace first"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  className={inputClassName}
                  placeholder="Create a board"
                  value={boardName}
                  onChange={(event) => setBoardName(event.target.value)}
                  disabled={!selectedWorkspaceId}
                />
                <button
                  type="button"
                  className={primaryButtonClassName}
                  onClick={submitBoard}
                  disabled={!selectedWorkspaceId || !boardName.trim()}
                >
                  Add board
                </button>
              </div>

              <div className="space-y-3">
                {boards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    isActive={board.id === selectedBoardId}
                    detail={
                      board.id === selectedBoardId
                        ? `${lists.length} lists loaded`
                        : "Click to view"
                    }
                    onClick={() => setSelectedBoardId(board.id)}
                  />
                ))}

                {selectedWorkspaceId &&
                !loading.boards &&
                boards.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    No boards in this workspace yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Board view
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedBoardId
                    ? "Lists and cards for the selected board"
                    : "Pick a board to load its lists"}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <input
                  className={`${inputClassName} sm:min-w-64`}
                  placeholder="Create a list"
                  value={listName}
                  onChange={(event) => setListName(event.target.value)}
                  disabled={!selectedBoardId}
                />
                <button
                  type="button"
                  className={primaryButtonClassName}
                  onClick={submitList}
                  disabled={!selectedBoardId || !listName.trim()}
                >
                  Add list
                </button>
              </div>
            </div>

            {selectedBoardId ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {lists.map((list) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    count={getCardsForList(list.id).length}
                  >
                    {getCardsForList(list.id).map((card) => (
                      <CardItem key={card.id} card={card} />
                    ))}

                    <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
                      <input
                        className={inputClassName}
                        placeholder="Create a card"
                        value={getCardDraft(list.id)}
                        onChange={(event) =>
                          setCardDraft(list.id, event.target.value)
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={primaryButtonClassName}
                          onClick={() => submitCard(list.id)}
                          disabled={!getCardDraft(list.id).trim()}
                        >
                          Add card
                        </button>
                        <button
                          type="button"
                          className={secondaryButtonClassName}
                          onClick={() => fetchCards(list.id)}
                          disabled={loading.cards}
                        >
                          Reload
                        </button>
                      </div>
                    </div>
                  </ListCard>
                ))}

                {!loading.lists && lists.length === 0 ? (
                  <div className="flex min-h-64 min-w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-sm text-slate-500">
                    No lists yet. Add the first list for this board.
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500">
                Select a workspace and board to start managing lists and cards.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
