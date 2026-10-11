import React, { useState } from 'react';
import { AppState, Household, Member, MemberChangeReason } from '../types';
import { calculateRefDate, formatIsoToDisplay, getTodayIso, isValidIsoDate } from '../services/dateHelpers';
import { countMembers } from '../services/calculationEngine';
import { t } from '../services/translations';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  ShieldCheck,
  Check,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const HouseholdsScreen: React.FC<Props> = ({ state, onUpdateState }) => {
  const { households, cardTypes, records, settings } = state;
  const lang = settings.language;

  // New Household form state
  const [isAddingHousehold, setIsAddingHousehold] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newHeadName, setNewHeadName] = useState('');
  const [newCardTypeId, setNewCardTypeId] = useState(cardTypes[0]?.id || '');

  // Member editing state
  const [selectedHhId, setSelectedHhId] = useState(households[0]?.id || '');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberAddedOn, setMemberAddedOn] = useState(getTodayIso());
  const [memberRemovedOn, setMemberRemovedOn] = useState('');
  const [memberReason, setMemberReason] = useState<MemberChangeReason>('Initial');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeHousehold = households.find((h) => h.id === selectedHhId) || households[0];
  const refDate = calculateRefDate(settings.selectedMonth, settings.refDayMode, settings.refDay);
  const activeMembersCount = activeHousehold ? countMembers(activeHousehold, settings.selectedMonth, settings) : 0;

  // Save new household
  const handleCreateHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!newCardNumber.trim() || !newHeadName.trim()) {
      setActionError('Card number and head of household name are required.');
      return;
    }

    if (households.some((h) => h.cardNumber.toLowerCase() === newCardNumber.trim().toLowerCase())) {
      setActionError('Ration card number must be unique.');
      return;
    }

    const newHh: Household = {
      id: `hh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cardNumber: newCardNumber.trim(),
      headName: newHeadName.trim(),
      cardTypeId: newCardTypeId,
      members: [
        {
          id: `m-${Date.now()}`,
          name: newHeadName.trim(),
          addedOn: getTodayIso(),
          removedOn: null,
          reason: 'Initial',
        },
      ],
      healthChecklist: {
        aadhaarLinked: false,
        ekycDone: false,
        shopMapped: false,
        memberListCurrent: false,
        mobileRegistered: false,
      },
    };

    onUpdateState({
      ...state,
      households: [...households, newHh],
    });

    setIsAddingHousehold(false);
    setNewCardNumber('');
    setNewHeadName('');
    setSelectedHhId(newHh.id);
  };

  // Delete Household (block if records exist)
  const handleDeleteHousehold = (hhId: string) => {
    setActionError(null);
    const hasRecords = records.some((r) => r.householdId === hhId);
    if (hasRecords) {
      setActionError(t('households.cannotDeleteWithRecords', undefined, lang));
      return;
    }

    const updated = households.filter((h) => h.id !== hhId);
    onUpdateState({
      ...state,
      households: updated,
    });
    if (selectedHhId === hhId && updated.length > 0) {
      setSelectedHhId(updated[0].id);
    }
  };

  // Save Member
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError(null);

    if (!memberName.trim() || !memberAddedOn) {
      setMemberError('Member name and date added are required.');
      return;
    }

    if (memberRemovedOn && memberRemovedOn < memberAddedOn) {
      setMemberError(t('households.dateOrderError', undefined, lang));
      return;
    }

    if (!activeHousehold) return;

    let updatedMembers: Member[] = [];
    if (editingMemberId) {
      updatedMembers = activeHousehold.members.map((m) => {
        if (m.id === editingMemberId) {
          return {
            ...m,
            name: memberName.trim(),
            addedOn: memberAddedOn,
            removedOn: memberRemovedOn || null,
            reason: memberReason,
          };
        }
        return m;
      });
    } else {
      const newM: Member = {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: memberName.trim(),
        addedOn: memberAddedOn,
        removedOn: memberRemovedOn || null,
        reason: memberReason,
      };
      updatedMembers = [...activeHousehold.members, newM];
    }

    const updatedHouseholds = households.map((h) =>
      h.id === activeHousehold.id ? { ...h, members: updatedMembers } : h
    );

    onUpdateState({ ...state, households: updatedHouseholds });

    setIsAddingMember(false);
    setEditingMemberId(null);
    setMemberName('');
    setMemberRemovedOn('');
  };

  const handleDeleteMember = (memberId: string) => {
    setActionError(null);
    if (!activeHousehold) return;
    if (activeHousehold.members.length <= 1) {
      setActionError('Household must have at least one member.');
      return;
    }

    const updatedMembers = activeHousehold.members.filter((m) => m.id !== memberId);
    const updatedHouseholds = households.map((h) =>
      h.id === activeHousehold.id ? { ...h, members: updatedMembers } : h
    );
    onUpdateState({ ...state, households: updatedHouseholds });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & New Household */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-700" />
            {t('households.title', undefined, lang)}
          </h2>
          <span className="text-xs text-stone-500">
            Manage fictional ration households, member rosters, addition/removal dates, and administrative health checklists.
          </span>
        </div>

        <button
          onClick={() => setIsAddingHousehold(!isAddingHousehold)}
          className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {t('btn.newHousehold', undefined, lang)}
        </button>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-stone-400 hover:text-stone-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* New Household Form */}
      {isAddingHousehold && (
        <form
          onSubmit={handleCreateHousehold}
          className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs space-y-4"
        >
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Register Fictional Household
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {t('households.cardNumber', undefined, lang)}
              </label>
              <input
                type="text"
                placeholder="e.g. MH-RAT-0982-PHH"
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(e.target.value)}
                required
                className="w-full p-2 bg-white border border-stone-300 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {t('households.headName', undefined, lang)}
              </label>
              <input
                type="text"
                placeholder="e.g. Anand Shinde (Fictional)"
                value={newHeadName}
                onChange={(e) => setNewHeadName(e.target.value)}
                required
                className="w-full p-2 bg-white border border-stone-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {t('households.cardType', undefined, lang)}
              </label>
              <select
                value={newCardTypeId}
                onChange={(e) => setNewCardTypeId(e.target.value)}
                className="w-full p-2 bg-white border border-stone-300 rounded-md font-medium"
              >
                {cardTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name} ({ct.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingHousehold(false)}
              className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-black"
            >
              Save Household
            </button>
          </div>
        </form>
      )}

      {/* Household Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {households.map((hh) => {
          const ct = cardTypes.find((c) => c.id === hh.cardTypeId);
          const isSelected = activeHousehold?.id === hh.id;

          return (
            <button
              key={hh.id}
              onClick={() => setSelectedHhId(hh.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 text-amber-950 ring-1 ring-amber-400'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              {ct && (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0"
                  style={{ backgroundColor: ct.colour }}
                />
              )}
              <span>{hh.headName}</span>
              <span className="text-stone-400 font-mono text-[11px]">({hh.cardNumber})</span>
            </button>
          );
        })}
      </div>

      {activeHousehold && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
          {/* Active Household Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">{activeHousehold.headName}</h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                Card No: {activeHousehold.cardNumber} |{' '}
                {cardTypes.find((c) => c.id === activeHousehold.cardTypeId)?.name || 'Unassigned'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDeleteHousehold(activeHousehold.id)}
                className="px-3 py-1.5 text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Household
              </button>
            </div>
          </div>

          {/* Members Count Notice */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
            <div className="font-bold text-stone-900">
              {t('households.membersCountedLabel', {
                count: activeMembersCount,
                refDate: formatIsoToDisplay(refDate),
              }, lang)}
            </div>
            <p className="text-stone-500 text-[11px]">
              {t('households.refCutoffNote', undefined, lang)}
            </p>
          </div>

          {/* Member Roster Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Family Member Roster ({activeHousehold.members.length})
              </h4>
              <button
                onClick={() => {
                  setIsAddingMember(true);
                  setEditingMemberId(null);
                  setMemberName('');
                  setMemberAddedOn(getTodayIso());
                  setMemberRemovedOn('');
                  setMemberReason('Initial');
                }}
                className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {t('btn.addMember', undefined, lang)}
              </button>
            </div>

            {/* Member Add/Edit Form */}
            {isAddingMember && (
              <form
                onSubmit={handleSaveMember}
                className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs"
              >
                <h5 className="font-bold text-stone-800">
                  {editingMemberId ? 'Edit Member Details' : 'Add Family Member'}
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Suman Shinde"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      required
                      className="w-full p-2 bg-white border border-stone-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {t('households.memberAddedOn', undefined, lang)}
                    </label>
                    <input
                      type="date"
                      value={memberAddedOn}
                      onChange={(e) => setMemberAddedOn(e.target.value)}
                      required
                      className="w-full p-2 bg-white border border-stone-300 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {t('households.memberRemovedOn', undefined, lang)} (optional)
                    </label>
                    <input
                      type="date"
                      value={memberRemovedOn}
                      onChange={(e) => setMemberRemovedOn(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {t('households.memberReason', undefined, lang)}
                    </label>
                    <select
                      value={memberReason}
                      onChange={(e) => setMemberReason(e.target.value as MemberChangeReason)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-md"
                    >
                      <option value="Initial">{t('households.reasonInitial', undefined, lang)}</option>
                      <option value="Birth">{t('households.reasonBirth', undefined, lang)}</option>
                      <option value="Marriage">{t('households.reasonMarriage', undefined, lang)}</option>
                      <option value="Death">{t('households.reasonDeath', undefined, lang)}</option>
                      <option value="Other">{t('households.reasonOther', undefined, lang)}</option>
                    </select>
                  </div>
                </div>

                {memberError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md">
                    {memberError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(false)}
                    className="px-3 py-1.5 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-black"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            )}

            {/* Members List */}
            <div className="border border-stone-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3">Member Name</th>
                    <th className="p-3">Added Date</th>
                    <th className="p-3">Removed Date</th>
                    <th className="p-3">Reason Note</th>
                    <th className="p-3">Counted ({formatIsoToDisplay(refDate)})</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {activeHousehold.members.map((m) => {
                    const isCounted =
                      m.addedOn <= refDate && (!m.removedOn || m.removedOn > refDate);

                    return (
                      <tr key={m.id} className="hover:bg-stone-50/50">
                        <td className="p-3 font-semibold text-stone-900">{m.name}</td>
                        <td className="p-3 font-mono">{formatIsoToDisplay(m.addedOn)}</td>
                        <td className="p-3 font-mono">{m.removedOn ? formatIsoToDisplay(m.removedOn) : '-'}</td>
                        <td className="p-3 text-stone-500">{m.reason}</td>
                        <td className="p-3">
                          {isCounted ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                              <UserCheck className="w-3.5 h-3.5" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-stone-400 font-medium">
                              <UserX className="w-3.5 h-3.5" /> Excluded
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setIsAddingMember(true);
                              setEditingMemberId(m.id);
                              setMemberName(m.name);
                              setMemberAddedOn(m.addedOn);
                              setMemberRemovedOn(m.removedOn || '');
                              setMemberReason(m.reason);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-800 mr-2"
                            title="Edit Member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id)}
                            className="p-1 text-stone-400 hover:text-red-600"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
