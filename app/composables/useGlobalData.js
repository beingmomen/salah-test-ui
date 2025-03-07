import { useApiRequest } from "./useApiRequest";
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onMounted, onUnmounted } from 'vue'

const allData = ref({})
const jobs = ref([])

export const useGlobalData = () =>  {
    const route = useRoute()
    const router = useRouter()
    const isMobileView = ref(false)
    const showMobileFilters = ref(false)
    const isViewportReady = ref(false)
    const pendingSearchQuery = ref('')
    const pendingDepartments = ref([])
    const pendingLocations = ref([])
    const pendingLevels = ref([])

    // Update mobile view status
    const updateMobileStatus = () => {
        isMobileView.value = window.innerWidth < 768
    }

    onMounted(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)')
        isMobileView.value = mediaQuery.matches
        isViewportReady.value = true
        
        const handleResize = (e) => {
            isMobileView.value = e.matches
        }
        
        mediaQuery.addEventListener('change', handleResize)
        
        onUnmounted(() => {
            mediaQuery.removeEventListener('change', handleResize)
        })
    })

    console.warn('router', route.query);

    const searchQuery = ref(route.query.search || '')
    const debouncedSearch = ref(searchQuery.value)

    watch(searchQuery, (newValue) => {
        if (isMobileView.value) {
            pendingSearchQuery.value = newValue
        } else {
            debouncedSearch.value = newValue
        }
    }, { immediate: true })

    // Debounced watcher to update filters
    watch(debouncedSearch, (newValue) => {
        if (!isMobileView.value) {
            updateFilters()
        }
    }, { debounce: 300 })

    // Watch for screen size changes to reset pending values
    watch(isMobileView, (newValue) => {
        if (newValue) {
            // When switching to mobile, initialize pending values
            pendingSearchQuery.value = searchQuery.value
            pendingDepartments.value = [...selectedDepartments.value]
            pendingLocations.value = [...selectedLocations.value]
            pendingLevels.value = [...selectedLevels.value]
        } else {
            // When switching to desktop, apply any pending changes
            if (showMobileFilters.value) {
                applyMobileFilters()
            }
            showMobileFilters.value = false
        }
    })

    const selectAllDepartments = ref(false)
    const selectAllLocations = ref(false)
    const selectAllLevels = ref(false)

    // Helper function to handle both string and array query params
    const parseQueryParam = (param) => {
        if (!param) return []
        // Handle comma-separated string values
        if (typeof param === 'string') {
            return param.split(',').map(String)
        }
        // Handle array values
        return Array.isArray(param) ? param.map(String) : [String(param)]
    }

    const selectedDepartments = ref(parseQueryParam(route.query.department))
    const selectedLocations = ref(parseQueryParam(route.query.location))
    const selectedLevels = ref(parseQueryParam(route.query.level))

    // Initialize pending selections
    pendingDepartments.value = [...selectedDepartments.value]
    pendingLocations.value = [...selectedLocations.value]
    pendingLevels.value = [...selectedLevels.value]

    const updateFilters = () => {
        // Don't update if any "Select All" is checked
        if (selectAllDepartments.value || selectAllLocations.value || selectAllLevels.value) {
            return;
        }

        const query = {}
        
        // Use the current active values based on view mode
        const searchValue = isMobileView.value ? pendingSearchQuery.value : debouncedSearch.value
        const depts = isMobileView.value ? pendingDepartments.value : selectedDepartments.value
        const locs = isMobileView.value ? pendingLocations.value : selectedLocations.value
        const lvls = isMobileView.value ? pendingLevels.value : selectedLevels.value
        
        if (searchValue) {
            query.search = searchValue
        }
        
        if (depts.length) {
            query.department = depts.join(',')
        }
        
        if (locs.length) {
            query.location = locs.join(',')
        }
        
        if (lvls.length) {
            query.level = lvls.join(',')
        }
        
        router.push({ query })

        if (isMobileView.value) {
            // Update the actual selections with pending values
            searchQuery.value = pendingSearchQuery.value
            selectedDepartments.value = [...pendingDepartments.value]
            selectedLocations.value = [...pendingLocations.value]
            selectedLevels.value = [...pendingLevels.value]
        }

        // Fetch jobs after updating the URL and selections
        fetchAllJobs()
    }

    const applyMobileFilters = () => {
        updateFilters()
    }

    const resetFilters = () => {
        // Reset all filter values
        searchQuery.value = ''
        debouncedSearch.value = ''
        pendingSearchQuery.value = ''
        
        selectedDepartments.value = []
        selectedLocations.value = []
        selectedLevels.value = []
        
        pendingDepartments.value = []
        pendingLocations.value = []
        pendingLevels.value = []
        
        selectAllDepartments.value = false
        selectAllLocations.value = false
        selectAllLevels.value = false

        // Clear URL query params
        router.push({ query: {} })

        // Fetch jobs with no filters
        fetchAllJobs()
    }

    const resetMobileFilters = () => {
        if (isMobileView.value) {
            // In mobile, only reset pending values
            pendingSearchQuery.value = ''
            pendingDepartments.value = []
            pendingLocations.value = []
            pendingLevels.value = []
            
            selectAllDepartments.value = false
            selectAllLocations.value = false
            selectAllLevels.value = false
        } else {
            resetFilters()
        }
    }

    const toggleAllDepartments = () => {
        selectAllDepartments.value = true;
        if (isMobileView.value) {
            pendingDepartments.value = []
        } else {
            selectedDepartments.value = []
        }
        // Clear query parameters when selecting "All"
        const newQuery = { ...route.query }
        delete newQuery.department
        router.push({ query: newQuery })
        // Reset jobs without department filter
        fetchAllJobs()
    }

    const toggleAllLocations = () => {
        selectAllLocations.value = true;
        if (isMobileView.value) {
            pendingLocations.value = []
        } else {
            selectedLocations.value = []
        }
        // Clear query parameters when selecting "All"
        const newQuery = { ...route.query }
        delete newQuery.location
        router.push({ query: newQuery })
        // Reset jobs without location filter
        fetchAllJobs()
    }

    const toggleAllLevels = () => {
        selectAllLevels.value = true;
        if (isMobileView.value) {
            pendingLevels.value = []
        } else {
            selectedLevels.value = []
        }
        // Clear query parameters when selecting "All"
        const newQuery = { ...route.query }
        delete newQuery.level
        router.push({ query: newQuery })
        // Reset jobs without level filter
        fetchAllJobs()
    }

    // Watch for changes in selections to update "Select All" states
    watch([selectedDepartments, pendingDepartments], ([selected, pending]) => {
        if (isMobileView.value) {
            // Uncheck "Select All" if there are selections
            if (pending.length > 0) {
                selectAllDepartments.value = false
            }
        } else {
            // Uncheck "Select All" if there are selections
            if (selected.length > 0) {
                selectAllDepartments.value = false
            }
        }
    })

    watch([selectedLocations, pendingLocations], ([selected, pending]) => {
        if (isMobileView.value) {
            // Uncheck "Select All" if there are selections
            if (pending.length > 0) {
                selectAllLocations.value = false
            }
        } else {
            // Uncheck "Select All" if there are selections
            if (selected.length > 0) {
                selectAllLocations.value = false
            }
        }
    })

    watch([selectedLevels, pendingLevels], ([selected, pending]) => {
        if (isMobileView.value) {
            // Uncheck "Select All" if there are selections
            if (pending.length > 0) {
                selectAllLevels.value = false
            }
        } else {
            // Uncheck "Select All" if there are selections
            if (selected.length > 0) {
                selectAllLevels.value = false
            }
        }
    })

    // Watch for changes in allData to update "Select All" states when data loads
    watch(() => allData.value, () => {
        const departments = allData.value.departments?.map(dept => String(dept.documentNumber)) || []
        const locations = allData.value.locations?.map(loc => String(loc.documentNumber)) || []
        const levels = allData.value.levels?.map(level => String(level.documentNumber)) || []

        if (isMobileView.value) {
            if (pendingDepartments.value.length > 0) {
                selectAllDepartments.value = false
            }
            if (pendingLocations.value.length > 0) {
                selectAllLocations.value = false
            }
            if (pendingLevels.value.length > 0) {
                selectAllLevels.value = false
            }
        } else {
            if (selectedDepartments.value.length > 0) {
                selectAllDepartments.value = false
            }
            if (selectedLocations.value.length > 0) {
                selectAllLocations.value = false
            }
            if (selectedLevels.value.length > 0) {
                selectAllLevels.value = false
            }
        }
    }, { immediate: true })

    const { get } = useApiRequest();

    const fetchGlobalData = async () => {
        const [departments, locations, levels] = await Promise.all([
            get('/departments/all'), 
            get('/locations/all'), 
            get('/levels/all')
        ])
    
        allData.value = {
            departments,
            locations,
            levels
        }
    }

    const fetchAllJobs = async () => {
        const params = {};
        
        // Use the current active values based on view mode
        const searchValue = isMobileView.value ? pendingSearchQuery.value : searchQuery.value;
        const depts = isMobileView.value ? pendingDepartments.value : selectedDepartments.value;
        const locs = isMobileView.value ? pendingLocations.value : selectedLocations.value;
        const lvls = isMobileView.value ? pendingLevels.value : selectedLevels.value;
        
        if (searchValue) params.search = searchValue;
        if (depts.length) params.department = depts.join(',');
        if (locs.length) params.location = locs.join(',');
        if (lvls.length) params.level = lvls.join(',');
        
        params.limit = 5;
        
        const options = { params };
        const {data} = await get('/jobs', options);
        jobs.value = data;
        return data;
    }

    return {
        fetchGlobalData,
        allData,
        jobs,
        fetchAllJobs,
        searchQuery,
        pendingSearchQuery,
        selectAllDepartments,
        selectAllLocations,
        selectAllLevels,
        selectedDepartments,
        selectedLocations,
        selectedLevels,
        pendingDepartments,
        pendingLocations,
        pendingLevels,
        updateFilters,
        toggleAllDepartments,
        toggleAllLocations,
        toggleAllLevels,
        isMobileView,
        isViewportReady,
        showMobileFilters,
        applyMobileFilters,
        resetMobileFilters,
        resetFilters
    }
}