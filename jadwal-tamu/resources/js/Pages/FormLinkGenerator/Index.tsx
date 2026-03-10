import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import CircularDatePicker from '@/Components/CircularDatePicker';

interface JadwalRapat {
  id: number;
  judul: string;
  rapat_code: string | null;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
}

interface IndexProps extends PageProps {
  jadwalRapats: JadwalRapat[];
}

export default function Index({ auth, jadwalRapats }: IndexProps) {
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [photoRequired, setPhotoRequired] = useState<boolean>(true);

  const [enableCloseTime, setEnableCloseTime] = useState<boolean>(false);
  const [closeTime, setCloseTime] = useState<string>('');

  // Custom Time Picker State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [pickerStep, setPickerStep] = useState<"hour" | "minute">("hour");

  // Custom Date/Time Storage for UI Selection
  const [closeDateUI, setCloseDateUI] = useState<Date | null>(null);
  const [closeTimeUI, setCloseTimeUI] = useState<string>('');

  const updateCloseDateTime = (date: Date | null, timeStr: string) => {
    if (!date || !timeStr) {
      setCloseTime('');
      updateLink(selectedCode, photoRequired, enableCloseTime, '');
      return;
    }
    const match = timeStr.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) return;
    let hour = parseInt(match[1], 10);
    const min = match[2];
    const isPM = match[3] === 'PM';

    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const isoString = `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${min}`;
    setCloseTime(isoString);
    updateLink(selectedCode, photoRequired, enableCloseTime, isoString);
  };

  const handleSetTimeFromPicker = () => {
    const formatted = `${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")} ${ampm}`;
    setCloseTimeUI(formatted);
    setShowTimePicker(false);
    setPickerStep("hour");
    updateCloseDateTime(closeDateUI || new Date(), formatted);
  };

  const updateLink = (code: string, reqPhoto: boolean, enableClose: boolean, cTime: string) => {
    if (code) {
      const baseUrl = window.location.origin;
      const url = new URL('/form-absen-rapat', baseUrl);
      url.searchParams.set('tujuan', code);
      if (!reqPhoto) {
        url.searchParams.set('photoRequired', 'false');
      }
      if (enableClose && cTime) {
        url.searchParams.set('closeTime', cTime);
      }
      setGeneratedLink(url.toString());
    } else {
      setGeneratedLink('');
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCode(code);
    setCopied(false);
    updateLink(code, photoRequired, enableCloseTime, closeTime);
  };

  const handlePhotoToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setPhotoRequired(isChecked);
    setCopied(false);
    updateLink(selectedCode, isChecked, enableCloseTime, closeTime);
  };

  const handleEnableCloseTimeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setEnableCloseTime(isChecked);
    setCopied(false);
    updateLink(selectedCode, photoRequired, isChecked, closeTime);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Form Link Generator</h2>}
    >
      <Head title="Form Link Generator" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Custom Form Link</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select a meeting schedule to generate a direct link. When guests open this link, the form will be pre-filled with the meeting details.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Jadwal Rapat
                </label>
                <select
                  value={selectedCode}
                  onChange={handleSelectChange}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                >
                  <option value="">-- Pilih Jadwal --</option>
                  {jadwalRapats.map((jadwal) => (
                    <option key={jadwal.id} value={jadwal.rapat_code || ''} disabled={!jadwal.rapat_code}>
                      {jadwal.judul} - {jadwal.tanggal} ({jadwal.jam_mulai.substring(0, 5)} - {jadwal.jam_selesai.substring(0, 5)})
                      {!jadwal.rapat_code && ' (No Code)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center">
                  <input
                    id="photo-required"
                    type="checkbox"
                    checked={photoRequired}
                    onChange={handlePhotoToggle}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="photo-required" className="ml-2 block text-sm text-gray-900">
                    Require Photo Upload
                  </label>
                </div>

                <div className="flex items-start flex-col gap-2">
                  <div className="flex items-center">
                    <input
                      id="enable-close-time"
                      type="checkbox"
                      checked={enableCloseTime}
                      onChange={handleEnableCloseTimeToggle}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-close-time" className="ml-2 block text-sm text-gray-900">
                      Set Automatic Form Close Time
                    </label>
                  </div>

                  {enableCloseTime && (
                    <div className="ml-6 flex flex-col w-full max-w-md gap-4 mt-2 border border-gray-200 p-4 rounded-md bg-gray-50/50">
                      <label className="text-xs text-gray-500 mb-1">Guests will see a "Closed" message after this time.</label>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Tanggal */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                          <div className="relative">
                            <CircularDatePicker
                              selectedDate={closeDateUI || new Date()}
                              onDateChange={(date: Date) => {
                                setCloseDateUI(date);
                                updateCloseDateTime(date, closeTimeUI);
                              }}
                            />
                            <FaCalendarAlt className="absolute right-3 top-3 text-[#0B3D91]" />
                          </div>
                        </div>

                        {/* Jam */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu</label>
                          <div className="relative">
                            <input
                              readOnly
                              value={closeTimeUI}
                              placeholder="Pilih waktu"
                              onClick={() => {
                                if (closeTimeUI) {
                                  const match = closeTimeUI.match(/(\d+):(\d+)\s(AM|PM)/);
                                  if (match) {
                                    setSelectedHour(parseInt(match[1], 10));
                                    setSelectedMinute(parseInt(match[2], 10));
                                    setAmpm(match[3] as "AM" | "PM");
                                  }
                                }
                                setShowTimePicker(true);
                              }}
                              className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 cursor-pointer text-gray-800"
                            />
                            <FaClock className="absolute right-3 top-3 text-[#0B3D91]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    window.axios.post('/form-link-generator', {
                      jadwal_rapat_id: jadwalRapats.find(j => j.rapat_code === selectedCode)?.id,
                      url: generatedLink,
                      photo_required: photoRequired,
                      close_time: enableCloseTime ? closeTime : null,
                    }).then(() => {
                      window.location.reload();
                    }).catch((err: any) => alert('Gagal menyimpan link.'));
                  }}
                  disabled={!generatedLink}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                >
                  Save & Generate Link
                </button>
              </div>

            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mt-8">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Saved Links / Active Forms</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage all generated links. Turning a link off will not physically delete it, but it allows you to track its status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadwal Rapat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Config</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(usePage().props.savedLinks as any[])?.map((link) => (
                    <tr key={link.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {link.jadwal_rapat?.judul || 'Unknown'} - {link.jadwal_rapat?.tanggal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Photo: {link.photo_required ? 'Yes' : 'No'}<br />
                        Close: {link.close_time ? new Date(link.close_time.replace(/Z$/, '')).toLocaleString() : 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <input type="text" readOnly value={link.url} className="w-32 text-xs border-gray-300 rounded" />
                          <button onClick={() => {
                            navigator.clipboard.writeText(link.url);
                            alert('Disalin!');
                          }} className="text-indigo-600 hover:text-indigo-900">Copy</button>
                          <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900">Open</a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${link.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            window.axios.put(`/form-link-generator/${link.id}/toggle`).then(() => window.location.reload());
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Hapus histori link ini?')) {
                              window.axios.delete(`/form-link-generator/${link.id}`).then(() => window.location.reload());
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!usePage().props.savedLinks || (usePage().props.savedLinks as any[]).length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada link yang disimpan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* TIME PICKER */}
      {showTimePicker && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]"
          onClick={() => setShowTimePicker(false)}
        >
          <div
            className="bg-white text-dark p-6 rounded-2xl shadow-lg"
            style={{
              width: 300,
              textAlign: "center",
              border: "3px solid #00427c",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 font-bold text-[#00427c] text-xl">
              {String(selectedHour).padStart(2, "0")}:
              {String(selectedMinute).padStart(2, "0")} {ampm}
            </h3>
            <div
              className="relative mx-auto my-5 rounded-full"
              style={{
                width: 220,
                height: 220,
                border: "3px solid #00427c",
              }}
            >
              {pickerStep === "hour" &&
                Array.from({ length: 12 }, (_, i) => {
                  const hour = i + 1;
                  const angle = (hour / 12) * 2 * Math.PI;
                  const x = 110 + 80 * Math.sin(angle);
                  const y = 110 - 80 * Math.cos(angle);
                  return (
                    <div
                      key={hour}
                      onClick={() => setSelectedHour(hour)}
                      style={{
                        position: "absolute",
                        top: y,
                        left: x,
                        transform: "translate(-50%, -50%)",
                        cursor: "pointer",
                        pointerEvents: "auto",
                        fontWeight: selectedHour === hour ? "bold" : "normal",
                        color: selectedHour === hour ? "#00427c" : "#374151",
                        fontSize: "1.1rem",
                      }}
                    >
                      {hour}
                    </div>
                  );
                })}

              {pickerStep === "minute" &&
                Array.from({ length: 12 }, (_, i) => {
                  const minute = i * 5;
                  const angle = (minute / 60) * 2 * Math.PI;
                  const x = 110 + 80 * Math.sin(angle);
                  const y = 110 - 80 * Math.cos(angle);
                  return (
                    <div
                      key={minute}
                      onClick={() => setSelectedMinute(minute)}
                      style={{
                        position: "absolute",
                        top: y,
                        left: x,
                        transform: "translate(-50%, -50%)",
                        cursor: "pointer",
                        pointerEvents: "auto",
                        fontWeight: selectedMinute === minute ? "bold" : "normal",
                        color: selectedMinute === minute ? "#00427c" : "#374151",
                        fontSize: "1rem",
                      }}
                    >
                      {minute.toString().padStart(2, "0")}
                    </div>
                  );
                })}

              {/* jarum */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${pickerStep === "hour"
                    ? (selectedHour % 12) * 30
                    : selectedMinute * 6
                    }deg)`,
                  transformOrigin: "center center",
                  transition: "transform 0.35s ease-in-out",
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: pickerStep === "hour" ? 65 : 80,
                    backgroundColor: "#00427c",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -100%)",
                    borderRadius: 2,
                    transformOrigin: "bottom center",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 12,
                    height: 12,
                    backgroundColor: "#00427c",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>

            {/* AM / PM */}
            <div className="mt-3">
              <button
                className={`px-3 py-1 rounded mr-2 ${ampm === "AM"
                  ? "bg-[#00427c] text-white"
                  : "border border-[#00427c] text-[#00427c]"
                  }`}
                onClick={() => setAmpm("AM")}
              >
                AM
              </button>
              <button
                className={`px-3 py-1 rounded ${ampm === "PM"
                  ? "bg-[#00427c] text-white"
                  : "border border-[#00427c] text-[#00427c]"
                  }`}
                onClick={() => setAmpm("PM")}
              >
                PM
              </button>
            </div>

            {/* Tombol kontrol */}
            <div className="flex justify-between mt-5">
              <button
                className="border px-3 py-1 rounded hover:bg-gray-100"
                onClick={() => {
                  setSelectedHour(12);
                  setSelectedMinute(0);
                  setPickerStep("hour");
                }}
              >
                Clear
              </button>
              {pickerStep === "hour" && (
                <button
                  className="border border-green-600 text-green-600 px-3 py-1 rounded"
                  onClick={() => setPickerStep("minute")}
                >
                  Next
                </button>
              )}
              {pickerStep === "minute" && (
                <button
                  className="bg-[#00427c] text-white px-3 py-1 rounded"
                  onClick={handleSetTimeFromPicker}
                >
                  Set
                </button>
              )}
              <button
                className="border border-red-600 text-red-600 px-3 py-1 rounded"
                onClick={() => {
                  setShowTimePicker(false);
                  setPickerStep("hour");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
