import { useApiRequest } from "./useApiRequest";
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onMounted, onUnmounted } from 'vue'

const allData = ref({})
const jobs = ref([])

export const useGlobalData = (opt) =>  {
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

    // Initialize "Select All" states to true by default
    const selectAllDepartments = ref(true)
    const selectAllLocations = ref(true)
    const selectAllLevels = ref(true)

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

    // Initialize empty selections since "Select All" is checked
    const selectedDepartments = ref([])
    const selectedLocations = ref([])
    const selectedLevels = ref([])

    // Initialize empty pending selections for mobile
    // const pendingDepartments = ref([])
    // const pendingLocations = ref([])
    // const pendingLevels = ref([])

    // If there are URL params, set them and uncheck "Select All"
    if (route.query.department) {
        selectedDepartments.value = parseQueryParam(route.query.department)
        selectAllDepartments.value = false
    }
    if (route.query.location) {
        selectedLocations.value = parseQueryParam(route.query.location)
        selectAllLocations.value = false
    }
    if (route.query.level) {
        selectedLevels.value = parseQueryParam(route.query.level)
        selectAllLevels.value = false
    }

    // Initialize pending selections for mobile view
    if (isMobileView.value) {
        pendingDepartments.value = [...selectedDepartments.value]
        pendingLocations.value = [...selectedLocations.value]
        pendingLevels.value = [...selectedLevels.value]
    }

    const updateFilters = () => {
        const query = {}
        
        // Use the current active values based on view mode
        const searchValue = isMobileView.value ? pendingSearchQuery.value : debouncedSearch.value

        // Handle departments
        if (isMobileView.value && !selectAllDepartments.value && pendingDepartments.value.length) {
            query.department = pendingDepartments.value.join(',')
        } else if (!isMobileView.value && !selectAllDepartments.value && selectedDepartments.value.length) {
            query.department = selectedDepartments.value.join(',')
        }
        
        // Handle locations
        if (isMobileView.value && !selectAllLocations.value && pendingLocations.value.length) {
            query.location = pendingLocations.value.join(',')
        } else if (!isMobileView.value && !selectAllLocations.value && selectedLocations.value.length) {
            query.location = selectedLocations.value.join(',')
        }
        
        // Handle levels
        if (isMobileView.value && !selectAllLevels.value && pendingLevels.value.length) {
            query.level = pendingLevels.value.join(',')
        } else if (!isMobileView.value && !selectAllLevels.value && selectedLevels.value.length) {
            query.level = selectedLevels.value.join(',')
        }

        // Handle search
        if (searchValue) {
            query.search = searchValue
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
        
        selectAllDepartments.value = true
        selectAllLocations.value = true
        selectAllLevels.value = true

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
            
            selectAllDepartments.value = true
            selectAllLocations.value = true
            selectAllLevels.value = true
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
            // Only update query and fetch jobs in desktop mode
            const newQuery = { ...route.query }
            delete newQuery.department
            router.push({ query: newQuery })
            fetchAllJobs()
        }
    }

    const toggleAllLocations = () => {
        selectAllLocations.value = true;
        if (isMobileView.value) {
            pendingLocations.value = []
        } else {
            selectedLocations.value = []
            // Only update query and fetch jobs in desktop mode
            const newQuery = { ...route.query }
            delete newQuery.location
            router.push({ query: newQuery })
            fetchAllJobs()
        }
    }

    const toggleAllLevels = () => {
        selectAllLevels.value = true;
        if (isMobileView.value) {
            pendingLevels.value = []
        } else {
            selectedLevels.value = []
            // Only update query and fetch jobs in desktop mode
            const newQuery = { ...route.query }
            delete newQuery.level
            router.push({ query: newQuery })
            fetchAllJobs()
        }
    }

    // Watch for changes in selections to update "Select All" states
    watch([selectedDepartments, pendingDepartments], ([selected, pending]) => {
        if (isMobileView.value) {
            selectAllDepartments.value = pending.length === 0
        } else {
            selectAllDepartments.value = selected.length === 0
        }
    })

    watch([selectedLocations, pendingLocations], ([selected, pending]) => {
        if (isMobileView.value) {
            selectAllLocations.value = pending.length === 0
        } else {
            selectAllLocations.value = selected.length === 0
        }
    })

    watch([selectedLevels, pendingLevels], ([selected, pending]) => {
        if (isMobileView.value) {
            selectAllLevels.value = pending.length === 0
        } else {
            selectAllLevels.value = selected.length === 0
        }
    })

    // Watch for changes in allData to update "Select All" states when data loads
    watch(() => allData.value, () => {
        if (isMobileView.value) {
            selectAllDepartments.value = pendingDepartments.value.length === 0
            selectAllLocations.value = pendingLocations.value.length === 0
            selectAllLevels.value = pendingLevels.value.length === 0
        } else {
            selectAllDepartments.value = selectedDepartments.value.length === 0
            selectAllLocations.value = selectedLocations.value.length === 0
            selectAllLevels.value = selectedLevels.value.length === 0
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

        console.warn('opt', opt);
        
        // Use the current active values based on view mode
        const searchValue = isMobileView.value ? pendingSearchQuery.value : searchQuery.value;
        const depts = isMobileView.value ? pendingDepartments.value : selectedDepartments.value;
        const locs = isMobileView.value ? pendingLocations.value : selectedLocations.value;
        const lvls = isMobileView.value ? pendingLevels.value : selectedLevels.value;
        
        if (searchValue) params.search = searchValue;
        if (depts.length) params.department = depts.join(',');
        if (locs.length) params.location = locs.join(',');
        if (lvls.length) params.level = lvls.join(',');
        if (opt?.isInternship) params.isInternship = true;
        
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